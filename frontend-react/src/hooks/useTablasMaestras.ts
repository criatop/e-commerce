import { useEffect, useState } from "react";
import { catalogApi } from "../api/catalog";
import { mapCategoria } from "../api/mappers";
import { COMUNAS, REGIONES, ROLES } from "../data/seed";
import type { Categoria, Comuna, Region, Rol } from "../types";

interface ColeccionUI<T> {
    datos: T[];
}

export function useTablasMaestras() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    useEffect(() => {
        let activo = true;
        void catalogApi
            .listCategories()
            .then((lista) => {
                if (activo) setCategorias(lista.map(mapCategoria));
            })
            .catch(() => {
                if (activo) setCategorias([]);
            });
        return () => {
            activo = false;
        };
    }, []);

    const categoriasUI: ColeccionUI<Categoria> = { datos: categorias };
    const regiones: ColeccionUI<Region> = { datos: REGIONES };
    const comunas: ColeccionUI<Comuna> = { datos: COMUNAS };
    const roles: ColeccionUI<Rol> = { datos: ROLES };

    function nombreCategoria(id: number | string | null | undefined): string {
        if (id === null || id === undefined || id === "") return "";
        return categorias.find((c) => String(c.id) === String(id))?.nombre ?? "";
    }

    function comunasDe(regionId: number): Comuna[] {
        return COMUNAS.filter((c) => c.regionId === regionId);
    }

    return { categorias: categoriasUI, regiones, comunas, roles, nombreCategoria, comunasDe };
}
