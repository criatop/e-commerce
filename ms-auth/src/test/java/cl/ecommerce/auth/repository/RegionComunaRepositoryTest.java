package cl.ecommerce.auth.repository;

import cl.ecommerce.auth.model.Comuna;
import cl.ecommerce.auth.model.Region;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class RegionComunaRepositoryTest {

    @Autowired
    private RegionRepository regionRepository;

    @Autowired
    private ComunaRepository comunaRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void regionsAreReturnedOrderedByOrden() {
        persistRegion(10, "Region Diez", 3);
        persistRegion(2, "Region Dos", 1);
        persistRegion(5, "Region Cinco", 2);

        List<Region> regiones = regionRepository.findAllByOrderByOrdenAsc();

        assertThat(regiones).extracting(Region::getId).containsExactly(2, 5, 10);
    }

    @Test
    void comunasAreFilteredByRegionAndSortedByName() {
        Region metropolitana = persistRegion(1, "Region Metropolitana", 1);
        Region valparaiso = persistRegion(2, "Valparaiso", 2);

        persistComuna(10, "Providencia", metropolitana);
        persistComuna(1, "Santiago", metropolitana);
        persistComuna(3, "Maipu", metropolitana);
        persistComuna(4, "Valparaiso", valparaiso);

        List<Comuna> comunas = comunaRepository.findByRegionIdOrderByNameAsc(1);

        assertThat(comunas).extracting(Comuna::getName).containsExactly("Maipu", "Providencia", "Santiago");
        assertThat(comunas).allSatisfy(comuna -> assertThat(comuna.getRegion().getId()).isEqualTo(1));
    }

    @Test
    void comunasUseAssignedIdsAndLazyRegion() {
        Region region = persistRegion(7, "Atacama", 7);
        persistComuna(29, "Copiapo", region);

        Comuna comuna = comunaRepository.findById(29).orElseThrow();

        assertThat(comuna.getId()).isEqualTo(29);
        assertThat(comuna.getRegion().getId()).isEqualTo(7);
    }

    private Region persistRegion(Integer id, String name, Integer orden) {
        Region region = Region.builder().id(id).name(name).orden(orden).build();
        return entityManager.persistAndFlush(region);
    }

    private Comuna persistComuna(Integer id, String name, Region region) {
        Comuna comuna = Comuna.builder().id(id).name(name).region(region).build();
        return entityManager.persistAndFlush(comuna);
    }
}
