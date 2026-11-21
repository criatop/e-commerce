package cl.ecommerce.auth.seed;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifica que las semillas de {@code init-multi-db/01-create-auth.sql} cumplen el
 * contrato que el backend y el frontend comparten: roles con ids fijos, 16 regiones,
 * las comunas del seed del frontend, y los cuatro usuarios demo con RUN valido y
 * contrasenas BCrypt que coinciden con las claves del seed.
 */
class AuthSeedScriptTest {

    private static final Path AUTH_SCRIPT = locate("init-multi-db/01-create-auth.sql");
    private static final Path FRONTEND_SEED = locate("frontend-react/src/data/seed.ts");

    private static final Map<String, String> DEMO_CREDENTIALS = new LinkedHashMap<>();

    static {
        DEMO_CREDENTIALS.put("admin@gmail.com", "admin123");
        DEMO_CREDENTIALS.put("vendedor@gmail.com", "vend1234");
        DEMO_CREDENTIALS.put("camila@gmail.com", "cliente1");
        DEMO_CREDENTIALS.put("diego@gmail.com", "diego123");
    }

    private final String script = read(AUTH_SCRIPT);
    private final Map<String, SeedTable> tables = SeedSql.parse(script);

    @Test
    void rolesAreSeededWithExplicitStableIds() {
        SeedTable roles = tables.get("roles");

        assertThat(roles).as("INSERT INTO roles").isNotNull();
        assertThat(roles.rows()).hasSize(3);
        assertThat(roles.columnIndex("id")).as("la columna id debe ser explicita").isNotNegative();

        Map<String, String> byId = new HashMap<>();
        for (List<String> row : roles.rows()) {
            byId.put(roles.value(row, "id"), roles.value(row, "name"));
        }
        assertThat(byId).containsExactlyInAnyOrderEntriesOf(Map.of(
                "1", "ADMIN",
                "2", "SELLER",
                "3", "CUSTOMER"));
    }

    @Test
    void regionsAreSeededWithSixteenStableIds() {
        SeedTable regions = tables.get("regions");

        assertThat(regions).as("INSERT INTO regions").isNotNull();
        assertThat(regions.rows()).hasSize(16);
        assertThat(regions.columnIndex("orden")).as("la columna orden debe existir").isNotNegative();

        List<String> ids = regions.rows().stream().map(r -> regions.value(r, "id")).toList();
        assertThat(ids).containsExactlyElementsOf(
                java.util.stream.IntStream.rangeClosed(1, 16).mapToObj(String::valueOf).toList());

        Set<String> names = new HashSet<>();
        for (List<String> row : regions.rows()) {
            String name = regions.value(row, "name");
            assertThat(name).as("nombre de region").isNotBlank();
            assertThat(names.add(name)).as("nombre de region duplicado: %s", name).isTrue();
            assertThat(Integer.parseInt(regions.value(row, "orden"))).isBetween(1, 16);
        }
    }

    @Test
    void comunasMatchTheFrontendSeedExactly() {
        SeedTable comunas = tables.get("comunas");
        assertThat(comunas).as("INSERT INTO comunas").isNotNull();

        List<String[]> frontend = frontendComunas();
        assertThat(frontend).as("comunas declaradas en frontend-react/src/data/seed.ts").hasSize(345);
        assertThat(comunas.rows()).hasSize(frontend.size());

        Set<String> ids = new HashSet<>();
        Map<String, String> byId = new HashMap<>();
        for (List<String> row : comunas.rows()) {
            String id = comunas.value(row, "id");
            String name = comunas.value(row, "name");
            String regionId = comunas.value(row, "region_id");

            assertThat(ids.add(id)).as("id de comuna duplicado: %s", id).isTrue();
            assertThat(Integer.parseInt(regionId)).as("region_id de %s", name).isBetween(1, 16);
            byId.put(id, name + "|" + regionId);
        }

        for (String[] expected : frontend) {
            assertThat(byId.get(expected[0]))
                    .as("comuna %s (%s) debe coincidir con el seed del frontend", expected[0], expected[2])
                    .isEqualTo(expected[2] + "|" + expected[1]);
        }
    }

    @Test
    void usersTableStoresRunAsUniqueAndFullProfile() {
        assertThat(script)
                .as("users.run debe ser unique y not null segun la decision de esquema")
                .containsPattern("(?is)run\\s+VARCHAR\\(\\d+\\)\\s+UNIQUE\\s+NOT\\s+NULL");

        SeedTable users = tables.get("users");
        assertThat(users).as("INSERT INTO users").isNotNull();
        assertThat(users.columns()).contains(
                "id", "run", "email", "password", "nombre", "apellidos", "fecha_nacimiento",
                "role_id", "region_id", "comuna_id", "direccion", "activo");
    }

    @Test
    void usersTableRequiresRole() {
        assertThat(script)
                .as("users.role_id debe ser NOT NULL: AuthService.login usa user.getRole().getName()")
                .containsPattern("(?is)role_id\\s+INT\\s+(?:NOT\\s+NULL\\s+REFERENCES\\s+roles\\(id\\)"
                        + "|REFERENCES\\s+roles\\(id\\)\\s+NOT\\s+NULL)");
    }

    @Test
    void comunasAreUniquePerRegionAndName() {
        assertThat(script)
                .as("comunas debe declarar UNIQUE(region_id, name)")
                .containsPattern("(?is)UNIQUE\\s*\\(\\s*region_id\\s*,\\s*name\\s*\\)");
    }

    @Test
    void demoUsersHaveValidAndDistinctRuns() {
        Map<String, String> runs = new HashMap<>();
        for (Map<String, String> user : demoUsers()) {
            String email = user.get("email");
            String run = user.get("run");

            assertThat(run).as("RUN de %s", email).isNotBlank();
            assertThat(isValidRun(run)).as("RUN invalido para %s: %s", email, run).isTrue();
            assertThat(runs.put(run, email)).as("RUN duplicado: %s", run).isNull();
        }
        assertThat(runs).hasSize(4);
    }

    @Test
    void demoUserPasswordHashesMatchSeedPasswords() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        for (Map<String, String> user : demoUsers()) {
            String email = user.get("email");
            String hash = user.get("password");

            assertThat(hash).as("hash de %s", email).startsWith("$2a$10$");
            assertThat(encoder.matches(DEMO_CREDENTIALS.get(email), hash))
                    .as("el hash guardado para %s debe coincidir con su clave demo", email)
                    .isTrue();
        }
    }

    @Test
    void demoUsersReferenceExistingRolesRegionsAndComunas() {
        SeedTable comunas = tables.get("comunas");
        Map<String, String> comunaToRegion = new HashMap<>();
        for (List<String> row : comunas.rows()) {
            comunaToRegion.put(comunas.value(row, "id"), comunas.value(row, "region_id"));
        }

        for (Map<String, String> user : demoUsers()) {
            String email = user.get("email");
            assertThat(user.get("role_id")).as("rol de %s", email).isIn("1", "2", "3");
            assertThat(user.get("region_id")).as("region de %s", email).isIn("1", "2", "3", "4", "5",
                    "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16");

            String comunaRegion = comunaToRegion.get(user.get("comuna_id"));
            assertThat(comunaRegion).as("comuna %s de %s", user.get("comuna_id"), email).isNotNull();
            assertThat(comunaRegion)
                    .as("la comuna de %s debe pertenecer a su region", email)
                    .isEqualTo(user.get("region_id"));
        }
    }

    private List<Map<String, String>> demoUsers() {
        SeedTable users = tables.get("users");
        assertThat(users).as("INSERT INTO users").isNotNull();

        List<Map<String, String>> demo = new ArrayList<>();
        for (List<String> row : users.rows()) {
            Map<String, String> user = new HashMap<>();
            for (String column : users.columns()) {
                user.put(column, users.value(row, column));
            }
            demo.add(user);
        }

        assertThat(demo).as("usuarios demo sembrados").hasSize(4);
        assertThat(demo.stream().map(u -> u.get("email")).toList())
                .containsExactlyInAnyOrderElementsOf(DEMO_CREDENTIALS.keySet());
        return demo;
    }

    /** Misma validacion de digito verificador que usa frontend-react/src/utils/run.ts. */
    private static boolean isValidRun(String run) {
        String limpio = run.replaceAll("[.\\-\\s]", "").toUpperCase();
        if (!limpio.matches("^[0-9]{7,8}[0-9K]$")) {
            return false;
        }
        String cuerpo = limpio.substring(0, limpio.length() - 1);
        char dv = limpio.charAt(limpio.length() - 1);

        int suma = 0;
        int multiplicador = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.digit(cuerpo.charAt(i), 10) * multiplicador;
            multiplicador = multiplicador == 7 ? 2 : multiplicador + 1;
        }
        int resto = 11 - (suma % 11);
        String esperado = resto == 11 ? "0" : resto == 10 ? "K" : String.valueOf(resto);
        return esperado.charAt(0) == dv;
    }

    private List<String[]> frontendComunas() {
        String seed = read(FRONTEND_SEED);
        int from = seed.indexOf("const COMUNAS");
        assertThat(from).as("const COMUNAS en seed.ts").isNotNegative();

        Matcher matcher = Pattern
                .compile("\\{\\s*id:\\s*(\\d+),\\s*regionId:\\s*(\\d+),\\s*nombre:\\s*\"([^\"]+)\"\\s*}")
                .matcher(seed.substring(from));
        List<String[]> comunas = new ArrayList<>();
        while (matcher.find()) {
            comunas.add(new String[]{matcher.group(1), matcher.group(2), matcher.group(3)});
        }
        return comunas;
    }

    private static Path locate(String relative) {
        Path current = Path.of("").toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve(relative);
            if (Files.exists(candidate)) {
                return candidate;
            }
            current = current.getParent();
        }
        throw new IllegalStateException("No se encontro " + relative + " desde " + Path.of("").toAbsolutePath());
    }

    private static String read(Path path) {
        try {
            return Files.readString(path, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** Parser minimo de los INSERT de un script SQL, suficiente para estas semillas. */
    private record SeedTable(List<String> columns, List<List<String>> rows) {

        int columnIndex(String column) {
            return columns.indexOf(column);
        }

        String value(List<String> row, String column) {
            int index = columnIndex(column);
            if (index < 0 || index >= row.size()) {
                return null;
            }
            return row.get(index);
        }
    }

    private static final class SeedSql {

        private static final Pattern INSERT = Pattern.compile(
                "(?is)INSERT\\s+INTO\\s+[\\\"`]?(\\w+)[\\\"`]?\\s*\\(([^)]*)\\)\\s*VALUES(.*?);");

        static Map<String, SeedTable> parse(String rawSql) {
            String sql = rawSql.lines()
                    .filter(line -> !line.trim().startsWith("--"))
                    .reduce("", (a, b) -> a + "\n" + b);

            Map<String, SeedTable> tables = new LinkedHashMap<>();
            Matcher matcher = INSERT.matcher(sql);
            while (matcher.find()) {
                String table = matcher.group(1).toLowerCase();
                List<String> columns = new ArrayList<>();
                for (String column : matcher.group(2).split(",")) {
                    columns.add(column.trim().toLowerCase());
                }
                tables.put(table, new SeedTable(columns, parseRows(matcher.group(3))));
            }
            return tables;
        }

        private static List<List<String>> parseRows(String values) {
            List<List<String>> rows = new ArrayList<>();
            List<String> current = null;
            StringBuilder field = new StringBuilder();
            boolean inQuote = false;

            for (int i = 0; i < values.length(); i++) {
                char c = values.charAt(i);

                if (inQuote) {
                    field.append(c);
                    if (c == '\'') {
                        if (i + 1 < values.length() && values.charAt(i + 1) == '\'') {
                            field.append('\'');
                            i++;
                        } else {
                            inQuote = false;
                        }
                    }
                    continue;
                }

                switch (c) {
                    case '\'' -> {
                        inQuote = true;
                        field.append(c);
                    }
                    case '(' -> {
                        current = new ArrayList<>();
                        field.setLength(0);
                    }
                    case ',' -> {
                        if (current != null) {
                            current.add(normalize(field));
                            field.setLength(0);
                        }
                    }
                    case ')' -> {
                        if (current != null) {
                            current.add(normalize(field));
                            rows.add(current);
                            current = null;
                            field.setLength(0);
                        }
                    }
                    default -> {
                        if (current != null) {
                            field.append(c);
                        }
                    }
                }
            }
            return rows;
        }

        private static String normalize(StringBuilder field) {
            String value = field.toString().trim();
            if (value.length() >= 2 && value.startsWith("'") && value.endsWith("'")) {
                return value.substring(1, value.length() - 1).replace("''", "'");
            }
            return value;
        }
    }
}
