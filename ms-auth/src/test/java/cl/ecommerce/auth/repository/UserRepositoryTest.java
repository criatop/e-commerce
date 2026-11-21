package cl.ecommerce.auth.repository;

import cl.ecommerce.auth.model.Role;
import cl.ecommerce.auth.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Role customer;

    @BeforeEach
    void setUp() {
        customer = entityManager.persistAndFlush(Role.builder().id(3).name("CUSTOMER").build());
    }

    @Test
    void searchMatchesRunEmailNameAndApellidosIgnoringCase() {
        persistUser("111111111", "camila@gmail.com", "Camila", "Rosales");
        persistUser("222222222", "diego@gmail.com", "Diego", "Perez");

        assertThat(userRepository.search("CAMILA")).extracting(User::getRun).containsExactly("111111111");
        assertThat(userRepository.search("perez")).extracting(User::getRun).containsExactly("222222222");
        assertThat(userRepository.search("111111111")).extracting(User::getRun).containsExactly("111111111");
        assertThat(userRepository.search("diego@")).extracting(User::getRun).containsExactly("222222222");
    }

    @Test
    void searchReturnsEmptyWhenNothingMatches() {
        persistUser("111111111", "camila@gmail.com", "Camila", "Rosales");

        assertThat(userRepository.search("inexistente")).isEmpty();
    }

    @Test
    void existsByRunDetectsDuplicates() {
        persistUser("111111111", "camila@gmail.com", "Camila", "Rosales");

        assertThat(userRepository.existsByRun("111111111")).isTrue();
        assertThat(userRepository.existsByRun("999999999")).isFalse();
    }

    private void persistUser(String run, String email, String nombre, String apellidos) {
        User user = User.builder()
                .run(run)
                .email(email)
                .password("encoded")
                .nombre(nombre)
                .apellidos(apellidos)
                .role(customer)
                .activo(true)
                .build();
        entityManager.persistAndFlush(user);
    }
}
