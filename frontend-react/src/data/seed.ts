import { CHIC_KEYS, CHIC_VERSION } from "../storage/claves";
import type {
  Categoria, Comuna, Noticia, Producto, Region, Rol, Usuario,
} from "../types";

const ROLES: Rol[] = [
  { id: 1, nombre: "Admin" },
  { id: 2, nombre: "Vendedor" },
  { id: 3, nombre: "Cliente" },
];

const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: "Collares", descripcion: "Collares, gargantillas y cadenas" },
  { id: 2, nombre: "Pulseras", descripcion: "Pulseras y brazaletes" },
  { id: 3, nombre: "Aros", descripcion: "Aros y pendientes" },
  { id: 4, nombre: "Diademas", descripcion: "Diademas y cintillos para todo estilo" },
  { id: 5, nombre: "Accesorios", descripcion: "Llaveros, cintillos y más" },
];

const REGIONES: Region[] = [
  { id: 1, nombre: "Región Metropolitana" },
  { id: 2, nombre: "Valparaíso" },
  { id: 3, nombre: "Biobío" },
  { id: 4, nombre: "Arica y Parinacota" },
  { id: 5, nombre: "Tarapacá" },
  { id: 6, nombre: "Antofagasta" },
  { id: 7, nombre: "Atacama" },
  { id: 8, nombre: "Coquimbo" },
  { id: 9, nombre: "Libertador General Bernardo O'Higgins" },
  { id: 10, nombre: "Maule" },
  { id: 11, nombre: "Ñuble" },
  { id: 12, nombre: "La Araucanía" },
  { id: 13, nombre: "Los Ríos" },
  { id: 14, nombre: "Los Lagos" },
  { id: 15, nombre: "Aysén del General Carlos Ibáñez del Campo" },
  { id: 16, nombre: "Magallanes y de la Antártica Chilena" },
];

const COMUNAS: Comuna[] = [
  // Region 1
  { id: 1, regionId: 1, nombre: "Santiago" }, { id: 2, regionId: 1, nombre: "Providencia" },
  { id: 3, regionId: 1, nombre: "Maipú" }, { id: 8, regionId: 1, nombre: "Las Condes" },
  { id: 9, regionId: 1, nombre: "Ñuñoa" }, { id: 10, regionId: 1, nombre: "Puente Alto" },
  { id: 11, regionId: 1, nombre: "La Florida" }, { id: 64, regionId: 1, nombre: "Alhué" },
  { id: 65, regionId: 1, nombre: "Buin" }, { id: 66, regionId: 1, nombre: "Calera de Tango" },
  { id: 67, regionId: 1, nombre: "Cerrillos" }, { id: 68, regionId: 1, nombre: "Cerro Navia" },
  { id: 69, regionId: 1, nombre: "Colina" }, { id: 70, regionId: 1, nombre: "Conchalí" },
  { id: 71, regionId: 1, nombre: "Curacaví" }, { id: 72, regionId: 1, nombre: "El Bosque" },
  { id: 73, regionId: 1, nombre: "El Monte" }, { id: 74, regionId: 1, nombre: "Estación Central" },
  { id: 75, regionId: 1, nombre: "Huechuraba" }, { id: 76, regionId: 1, nombre: "Independencia" },
  { id: 77, regionId: 1, nombre: "Isla de Maipo" }, { id: 78, regionId: 1, nombre: "La Cisterna" },
  { id: 79, regionId: 1, nombre: "La Granja" }, { id: 80, regionId: 1, nombre: "La Pintana" },
  { id: 81, regionId: 1, nombre: "La Reina" }, { id: 82, regionId: 1, nombre: "Lampa" },
  { id: 83, regionId: 1, nombre: "Lo Barnechea" }, { id: 84, regionId: 1, nombre: "Lo Espejo" },
  { id: 85, regionId: 1, nombre: "Lo Prado" }, { id: 86, regionId: 1, nombre: "Macul" },
  { id: 87, regionId: 1, nombre: "María Pinto" }, { id: 88, regionId: 1, nombre: "Melipilla" },
  { id: 89, regionId: 1, nombre: "Padre Hurtado" }, { id: 90, regionId: 1, nombre: "Paine" },
  { id: 91, regionId: 1, nombre: "Pedro Aguirre Cerda" }, { id: 92, regionId: 1, nombre: "Peñaflor" },
  { id: 93, regionId: 1, nombre: "Peñalolén" }, { id: 94, regionId: 1, nombre: "Pirque" },
  { id: 95, regionId: 1, nombre: "Pudahuel" }, { id: 96, regionId: 1, nombre: "Quilicura" },
  { id: 97, regionId: 1, nombre: "Quinta Normal" }, { id: 98, regionId: 1, nombre: "Recoleta" },
  { id: 99, regionId: 1, nombre: "Renca" }, { id: 100, regionId: 1, nombre: "San Bernardo" },
  { id: 101, regionId: 1, nombre: "San Joaquín" }, { id: 102, regionId: 1, nombre: "San José de Maipo" },
  { id: 103, regionId: 1, nombre: "San Miguel" }, { id: 104, regionId: 1, nombre: "San Pedro" },
  { id: 105, regionId: 1, nombre: "San Ramón" }, { id: 106, regionId: 1, nombre: "Talagante" },
  { id: 107, regionId: 1, nombre: "Tiltil" }, { id: 108, regionId: 1, nombre: "Vitacura" },
  // Region 2
  { id: 4, regionId: 2, nombre: "Valparaíso" }, { id: 5, regionId: 2, nombre: "Viña del Mar" },
  { id: 12, regionId: 2, nombre: "Quilpué" }, { id: 13, regionId: 2, nombre: "Villa Alemana" },
  { id: 14, regionId: 2, nombre: "San Antonio" }, { id: 15, regionId: 2, nombre: "Los Andes" },
  { id: 109, regionId: 2, nombre: "Algarrobo" }, { id: 110, regionId: 2, nombre: "Cabildo" },
  { id: 111, regionId: 2, nombre: "Calera" }, { id: 112, regionId: 2, nombre: "Calle Larga" },
  { id: 113, regionId: 2, nombre: "Cartagena" }, { id: 114, regionId: 2, nombre: "Casablanca" },
  { id: 115, regionId: 2, nombre: "Catemu" }, { id: 116, regionId: 2, nombre: "Concón" },
  { id: 117, regionId: 2, nombre: "El Quisco" }, { id: 118, regionId: 2, nombre: "El Tabo" },
  { id: 119, regionId: 2, nombre: "Hijuelas" }, { id: 120, regionId: 2, nombre: "Isla de Pascua" },
  { id: 121, regionId: 2, nombre: "Juan Fernández" }, { id: 122, regionId: 2, nombre: "La Cruz" },
  { id: 123, regionId: 2, nombre: "La Ligua" }, { id: 124, regionId: 2, nombre: "Limache" },
  { id: 125, regionId: 2, nombre: "Llaillay" }, { id: 126, regionId: 2, nombre: "Nogales" },
  { id: 127, regionId: 2, nombre: "Olmué" }, { id: 128, regionId: 2, nombre: "Panquehue" },
  { id: 129, regionId: 2, nombre: "Papudo" }, { id: 130, regionId: 2, nombre: "Petorca" },
  { id: 131, regionId: 2, nombre: "Puchuncaví" }, { id: 132, regionId: 2, nombre: "Putaendo" },
  { id: 133, regionId: 2, nombre: "Quillota" }, { id: 134, regionId: 2, nombre: "Quintero" },
  { id: 135, regionId: 2, nombre: "Rinconada" }, { id: 136, regionId: 2, nombre: "San Esteban" },
  { id: 137, regionId: 2, nombre: "San Felipe" }, { id: 138, regionId: 2, nombre: "Santa María" },
  { id: 139, regionId: 2, nombre: "Santo Domingo" }, { id: 140, regionId: 2, nombre: "Zapallar" },
  // Region 3
  { id: 6, regionId: 3, nombre: "Concepción" }, { id: 7, regionId: 3, nombre: "Talcahuano" },
  { id: 16, regionId: 3, nombre: "Hualpén" }, { id: 17, regionId: 3, nombre: "San Pedro de la Paz" },
  { id: 18, regionId: 3, nombre: "Coronel" }, { id: 19, regionId: 3, nombre: "Los Angeles" },
  { id: 141, regionId: 3, nombre: "Alto Biobío" }, { id: 142, regionId: 3, nombre: "Antuco" },
  { id: 143, regionId: 3, nombre: "Arauco" }, { id: 144, regionId: 3, nombre: "Cabrero" },
  { id: 145, regionId: 3, nombre: "Cañete" }, { id: 146, regionId: 3, nombre: "Chiguayante" },
  { id: 147, regionId: 3, nombre: "Contulmo" }, { id: 148, regionId: 3, nombre: "Curanilahue" },
  { id: 149, regionId: 3, nombre: "Florida" }, { id: 150, regionId: 3, nombre: "Hualqui" },
  { id: 151, regionId: 3, nombre: "Laja" }, { id: 152, regionId: 3, nombre: "Lebu" },
  { id: 153, regionId: 3, nombre: "Los Alamos" }, { id: 154, regionId: 3, nombre: "Lota" },
  { id: 155, regionId: 3, nombre: "Mulchén" }, { id: 156, regionId: 3, nombre: "Nacimiento" },
  { id: 157, regionId: 3, nombre: "Negrete" }, { id: 158, regionId: 3, nombre: "Penco" },
  { id: 159, regionId: 3, nombre: "Quilaco" }, { id: 160, regionId: 3, nombre: "Quilleco" },
  { id: 161, regionId: 3, nombre: "San Rosendo" }, { id: 162, regionId: 3, nombre: "Santa Bárbara" },
  { id: 163, regionId: 3, nombre: "Santa Juana" }, { id: 164, regionId: 3, nombre: "Tirúa" },
  { id: 165, regionId: 3, nombre: "Tomé" }, { id: 166, regionId: 3, nombre: "Tucapel" },
  { id: 167, regionId: 3, nombre: "Yumbel" },
  // Region 4
  { id: 20, regionId: 4, nombre: "Arica" }, { id: 21, regionId: 4, nombre: "Putre" },
  { id: 22, regionId: 4, nombre: "Camarones" }, { id: 168, regionId: 4, nombre: "General Lagos" },
  // Region 5
  { id: 23, regionId: 5, nombre: "Iquique" }, { id: 24, regionId: 5, nombre: "Alto Hospicio" },
  { id: 25, regionId: 5, nombre: "Pozo Almonte" }, { id: 169, regionId: 5, nombre: "Camiña" },
  { id: 170, regionId: 5, nombre: "Colchane" }, { id: 171, regionId: 5, nombre: "Huara" },
  { id: 172, regionId: 5, nombre: "Pica" },
  // Region 6
  { id: 26, regionId: 6, nombre: "Antofagasta" }, { id: 27, regionId: 6, nombre: "Calama" },
  { id: 28, regionId: 6, nombre: "Tocopilla" }, { id: 173, regionId: 6, nombre: "María Elena" },
  { id: 174, regionId: 6, nombre: "Mejillones" }, { id: 175, regionId: 6, nombre: "Ollagüe" },
  { id: 176, regionId: 6, nombre: "San Pedro de Atacama" }, { id: 177, regionId: 6, nombre: "Sierra Gorda" },
  { id: 178, regionId: 6, nombre: "Taltal" },
  // Region 7
  { id: 29, regionId: 7, nombre: "Copiapó" }, { id: 30, regionId: 7, nombre: "Vallenar" },
  { id: 31, regionId: 7, nombre: "Huasco" }, { id: 179, regionId: 7, nombre: "Alto del Carmen" },
  { id: 180, regionId: 7, nombre: "Caldera" }, { id: 181, regionId: 7, nombre: "Chañaral" },
  { id: 182, regionId: 7, nombre: "Diego de Almagro" }, { id: 183, regionId: 7, nombre: "Freirina" },
  { id: 184, regionId: 7, nombre: "Tierra Amarilla" },
  // Region 8
  { id: 32, regionId: 8, nombre: "La Serena" }, { id: 33, regionId: 8, nombre: "Coquimbo" },
  { id: 34, regionId: 8, nombre: "Ovalle" }, { id: 35, regionId: 8, nombre: "Illapel" },
  { id: 185, regionId: 8, nombre: "Andacollo" }, { id: 186, regionId: 8, nombre: "Canela" },
  { id: 187, regionId: 8, nombre: "Combarbalá" }, { id: 188, regionId: 8, nombre: "La Higuera" },
  { id: 189, regionId: 8, nombre: "Los Vilos" }, { id: 190, regionId: 8, nombre: "Monte Patria" },
  { id: 191, regionId: 8, nombre: "Paihuano" }, { id: 192, regionId: 8, nombre: "Punitaqui" },
  { id: 193, regionId: 8, nombre: "Río Hurtado" }, { id: 194, regionId: 8, nombre: "Salamanca" },
  { id: 195, regionId: 8, nombre: "Vicuña" },
  // Region 9
  { id: 36, regionId: 9, nombre: "Rancagua" }, { id: 37, regionId: 9, nombre: "San Fernando" },
  { id: 38, regionId: 9, nombre: "Santa Cruz" }, { id: 39, regionId: 9, nombre: "Rengo" },
  { id: 196, regionId: 9, nombre: "Chépica" }, { id: 197, regionId: 9, nombre: "Chimbarongo" },
  { id: 198, regionId: 9, nombre: "Codegua" }, { id: 199, regionId: 9, nombre: "Coinco" },
  { id: 200, regionId: 9, nombre: "Coltauco" }, { id: 201, regionId: 9, nombre: "Doñihue" },
  { id: 202, regionId: 9, nombre: "Graneros" }, { id: 203, regionId: 9, nombre: "La Estrella" },
  { id: 204, regionId: 9, nombre: "Las Cabras" }, { id: 205, regionId: 9, nombre: "Litueche" },
  { id: 206, regionId: 9, nombre: "Lolol" }, { id: 207, regionId: 9, nombre: "Machalí" },
  { id: 208, regionId: 9, nombre: "Malloa" }, { id: 209, regionId: 9, nombre: "Marchigüe" },
  { id: 210, regionId: 9, nombre: "Mostazal" }, { id: 211, regionId: 9, nombre: "Nancagua" },
  { id: 212, regionId: 9, nombre: "Navidad" }, { id: 213, regionId: 9, nombre: "Olivar" },
  { id: 214, regionId: 9, nombre: "Palmilla" }, { id: 215, regionId: 9, nombre: "Paredones" },
  { id: 216, regionId: 9, nombre: "Peralillo" }, { id: 217, regionId: 9, nombre: "Peumo" },
  { id: 218, regionId: 9, nombre: "Pichidegua" }, { id: 219, regionId: 9, nombre: "Pichilemu" },
  { id: 220, regionId: 9, nombre: "Placilla" }, { id: 221, regionId: 9, nombre: "Pumanque" },
  { id: 222, regionId: 9, nombre: "Quinta de Tilcoco" }, { id: 223, regionId: 9, nombre: "Requínoa" },
  { id: 224, regionId: 9, nombre: "San Vicente" },
  // Region 10
  { id: 40, regionId: 10, nombre: "Talca" }, { id: 41, regionId: 10, nombre: "Curicó" },
  { id: 42, regionId: 10, nombre: "Linares" }, { id: 43, regionId: 10, nombre: "Constitución" },
  { id: 225, regionId: 10, nombre: "Cauquenes" }, { id: 226, regionId: 10, nombre: "Chanco" },
  { id: 227, regionId: 10, nombre: "Colbún" }, { id: 228, regionId: 10, nombre: "Curepto" },
  { id: 229, regionId: 10, nombre: "Empedrado" }, { id: 230, regionId: 10, nombre: "Hualañé" },
  { id: 231, regionId: 10, nombre: "Licantén" }, { id: 232, regionId: 10, nombre: "Longaví" },
  { id: 233, regionId: 10, nombre: "Maule" }, { id: 234, regionId: 10, nombre: "Molina" },
  { id: 235, regionId: 10, nombre: "Parral" }, { id: 236, regionId: 10, nombre: "Pelarco" },
  { id: 237, regionId: 10, nombre: "Pelluhue" }, { id: 238, regionId: 10, nombre: "Pencahue" },
  { id: 239, regionId: 10, nombre: "Rauco" }, { id: 240, regionId: 10, nombre: "Retiro" },
  { id: 241, regionId: 10, nombre: "Río Claro" }, { id: 242, regionId: 10, nombre: "Romeral" },
  { id: 243, regionId: 10, nombre: "Sagrada Familia" }, { id: 244, regionId: 10, nombre: "San Clemente" },
  { id: 245, regionId: 10, nombre: "San Javier" }, { id: 246, regionId: 10, nombre: "San Rafael" },
  { id: 247, regionId: 10, nombre: "Teno" }, { id: 248, regionId: 10, nombre: "Vichuquén" },
  { id: 249, regionId: 10, nombre: "Villa Alegre" }, { id: 250, regionId: 10, nombre: "Yerbas Buenas" },
  // Region 11
  { id: 44, regionId: 11, nombre: "Chillán" }, { id: 45, regionId: 11, nombre: "San Carlos" },
  { id: 46, regionId: 11, nombre: "Quillón" }, { id: 251, regionId: 11, nombre: "Bulnes" },
  { id: 252, regionId: 11, nombre: "Chillán Viejo" }, { id: 253, regionId: 11, nombre: "Cobquecura" },
  { id: 254, regionId: 11, nombre: "Coelemu" }, { id: 255, regionId: 11, nombre: "Coihueco" },
  { id: 256, regionId: 11, nombre: "El Carmen" }, { id: 257, regionId: 11, nombre: "Ninhue" },
  { id: 258, regionId: 11, nombre: "Ñiquén" }, { id: 259, regionId: 11, nombre: "Pemuco" },
  { id: 260, regionId: 11, nombre: "Pinto" }, { id: 261, regionId: 11, nombre: "Portezuelo" },
  { id: 262, regionId: 11, nombre: "Quirihue" }, { id: 263, regionId: 11, nombre: "Ranquil" },
  { id: 264, regionId: 11, nombre: "San Fabián" }, { id: 265, regionId: 11, nombre: "San Ignacio" },
  { id: 266, regionId: 11, nombre: "San Nicolás" }, { id: 267, regionId: 11, nombre: "Treguaco" },
  { id: 268, regionId: 11, nombre: "Yungay" },
  // Region 12
  { id: 47, regionId: 12, nombre: "Temuco" }, { id: 48, regionId: 12, nombre: "Villarrica" },
  { id: 49, regionId: 12, nombre: "Pucón" }, { id: 50, regionId: 12, nombre: "Angol" },
  { id: 269, regionId: 12, nombre: "Carahue" }, { id: 270, regionId: 12, nombre: "Cholchol" },
  { id: 271, regionId: 12, nombre: "Collipulli" }, { id: 272, regionId: 12, nombre: "Cunco" },
  { id: 273, regionId: 12, nombre: "Curacautín" }, { id: 274, regionId: 12, nombre: "Curarrehue" },
  { id: 275, regionId: 12, nombre: "Ercilla" }, { id: 276, regionId: 12, nombre: "Freire" },
  { id: 277, regionId: 12, nombre: "Galvarino" }, { id: 278, regionId: 12, nombre: "Gorbea" },
  { id: 279, regionId: 12, nombre: "Lautaro" }, { id: 280, regionId: 12, nombre: "Loncoche" },
  { id: 281, regionId: 12, nombre: "Lonquimay" }, { id: 282, regionId: 12, nombre: "Los Sauces" },
  { id: 283, regionId: 12, nombre: "Lumaco" }, { id: 284, regionId: 12, nombre: "Melipeuco" },
  { id: 285, regionId: 12, nombre: "Nueva Imperial" }, { id: 286, regionId: 12, nombre: "Padre Las Casas" },
  { id: 287, regionId: 12, nombre: "Perquenco" }, { id: 288, regionId: 12, nombre: "Pitrufquén" },
  { id: 289, regionId: 12, nombre: "Purén" }, { id: 290, regionId: 12, nombre: "Renaico" },
  { id: 291, regionId: 12, nombre: "Saavedra" }, { id: 292, regionId: 12, nombre: "Teodoro Schmidt" },
  { id: 293, regionId: 12, nombre: "Toltén" }, { id: 294, regionId: 12, nombre: "Traiguén" },
  { id: 295, regionId: 12, nombre: "Victoria" }, { id: 296, regionId: 12, nombre: "Vilcún" },
  // Region 13
  { id: 51, regionId: 13, nombre: "Valdivia" }, { id: 52, regionId: 13, nombre: "La Unión" },
  { id: 53, regionId: 13, nombre: "Río Bueno" }, { id: 297, regionId: 13, nombre: "Corral" },
  { id: 298, regionId: 13, nombre: "Futrono" }, { id: 299, regionId: 13, nombre: "Lago Ranco" },
  { id: 300, regionId: 13, nombre: "Lanco" }, { id: 301, regionId: 13, nombre: "Los Lagos" },
  { id: 302, regionId: 13, nombre: "Máfil" }, { id: 303, regionId: 13, nombre: "Mariquina" },
  { id: 304, regionId: 13, nombre: "Paillaco" }, { id: 305, regionId: 13, nombre: "Panguipulli" },
  // Region 14
  { id: 54, regionId: 14, nombre: "Puerto Montt" }, { id: 55, regionId: 14, nombre: "Osorno" },
  { id: 56, regionId: 14, nombre: "Castro" }, { id: 57, regionId: 14, nombre: "Ancud" },
  { id: 306, regionId: 14, nombre: "Calbuco" }, { id: 307, regionId: 14, nombre: "Chaitén" },
  { id: 308, regionId: 14, nombre: "Chonchi" }, { id: 309, regionId: 14, nombre: "Cochamó" },
  { id: 310, regionId: 14, nombre: "Curaco de Vélez" }, { id: 311, regionId: 14, nombre: "Dalcahue" },
  { id: 312, regionId: 14, nombre: "Fresia" }, { id: 313, regionId: 14, nombre: "Frutillar" },
  { id: 314, regionId: 14, nombre: "Futaleufú" }, { id: 315, regionId: 14, nombre: "Hualaihué" },
  { id: 316, regionId: 14, nombre: "Llanquihue" }, { id: 317, regionId: 14, nombre: "Los Muermos" },
  { id: 318, regionId: 14, nombre: "Maullín" }, { id: 319, regionId: 14, nombre: "Palena" },
  { id: 320, regionId: 14, nombre: "Puerto Octay" }, { id: 321, regionId: 14, nombre: "Puerto Varas" },
  { id: 322, regionId: 14, nombre: "Puqueldón" }, { id: 323, regionId: 14, nombre: "Purranque" },
  { id: 324, regionId: 14, nombre: "Puyehue" }, { id: 325, regionId: 14, nombre: "Queilén" },
  { id: 326, regionId: 14, nombre: "Quellón" }, { id: 327, regionId: 14, nombre: "Quemchi" },
  { id: 328, regionId: 14, nombre: "Quinchao" }, { id: 329, regionId: 14, nombre: "Río Negro" },
  { id: 330, regionId: 14, nombre: "San Juan de la Costa" }, { id: 331, regionId: 14, nombre: "San Pablo" },
  // Region 15
  { id: 58, regionId: 15, nombre: "Coyhaique" }, { id: 59, regionId: 15, nombre: "Aysén" },
  { id: 60, regionId: 15, nombre: "Chile Chico" }, { id: 332, regionId: 15, nombre: "Cisnes" },
  { id: 333, regionId: 15, nombre: "Cochrane" }, { id: 334, regionId: 15, nombre: "Guaitecas" },
  { id: 335, regionId: 15, nombre: "Lago Verde" }, { id: 336, regionId: 15, nombre: "O'Higgins" },
  { id: 337, regionId: 15, nombre: "Río Ibáñez" }, { id: 338, regionId: 15, nombre: "Tortel" },
  // Region 16
  { id: 61, regionId: 16, nombre: "Punta Arenas" }, { id: 62, regionId: 16, nombre: "Natales" },
  { id: 63, regionId: 16, nombre: "Porvenir" }, { id: 339, regionId: 16, nombre: "Cabo de Hornos" },
  { id: 340, regionId: 16, nombre: "Laguna Blanca" }, { id: 341, regionId: 16, nombre: "Primavera" },
  { id: 342, regionId: 16, nombre: "Río Verde" }, { id: 343, regionId: 16, nombre: "San Gregorio" },
  { id: 344, regionId: 16, nombre: "Timaukel" }, { id: 345, regionId: 16, nombre: "Torres del Paine" }
];

const USUARIOS: Usuario[] = [
  { run: "111111111", nombre: "Admin", apellidos: "Pink", correo: "admin@gmail.com", password: "admin123", fechaNacimiento: "1990-01-01", rolId: 1, regionId: 1, comunaId: 1, direccion: "Av. Principal 123", estado: "Activo" },
  { run: "222222222", nombre: "Vendedor", apellidos: "Pink", correo: "vendedor@gmail.com", password: "vend1234", fechaNacimiento: "1992-05-14", rolId: 2, regionId: 1, comunaId: 2, direccion: "Calle Venta 456", estado: "Activo" },
  { run: "333333333", nombre: "Camila", apellidos: "Rosales", correo: "camila@gmail.com", password: "cliente1", fechaNacimiento: "1998-03-22", rolId: 3, regionId: 2, comunaId: 4, direccion: "Los Aromos 789", estado: "Activo" },
  { run: "444444444", nombre: "Diego", apellidos: "Pérez", correo: "diego@gmail.com", password: "diego123", fechaNacimiento: "1996-07-10", rolId: 3, regionId: 1, comunaId: 3, direccion: "Av. Central 555", estado: "Activo" },
];

const PRODUCTOS: Producto[] = [
  { codigo: "CH-001", nombre: "Aros Dorados", descripcion: "Aros dorados clásicos que aportan luz y brillo a cualquier look de día.", precio: 11500, stock: 15, stockCritico: 4, categoriaId: 3, imagen: "productos/aros1.jpg", estado: "Activo" },
  { codigo: "CH-002", nombre: "Cintillo Hojas Doradas", descripcion: "Cintillo dorado con delicadas hojas que realzan cualquier peinado.", precio: 8500, stock: 20, stockCritico: 5, categoriaId: 5, imagen: "productos/cintillo.jpg", estado: "Activo" },
  { codigo: "CH-003", nombre: "Collar Corazón Dorado", descripcion: "Collar con colgante en forma de corazón dorado, romántico y versátil.", precio: 15900, stock: 12, stockCritico: 3, categoriaId: 1, imagen: "productos/collar1.jpg", estado: "Activo" },
  { codigo: "CH-004", nombre: "Collar Perlado Corazón Rojo", descripcion: "Collar aperlado con colgante de corazón rojo para un toque lleno de pasión.", precio: 16900, stock: 10, stockCritico: 3, categoriaId: 1, imagen: "productos/collar2.jpg", estado: "Activo" },
  { codigo: "CH-005", nombre: "Collar Playero Estrellas de Mar", descripcion: "Collar estilo playero adornado con conchitas y estrellas de mar.", precio: 13900, stock: 14, stockCritico: 4, categoriaId: 1, imagen: "productos/collar3.jpg", estado: "Activo" },
  { codigo: "CH-006", nombre: "Collar Perlas y Medallas", descripcion: "Collar con perlas y medallas decorativas, elegante y con mucho estilo.", precio: 17900, stock: 8, stockCritico: 3, categoriaId: 1, imagen: "productos/collar4.jpg", estado: "Activo" },
  { codigo: "CH-007", nombre: "Diadema Multicolor", descripcion: "Diademas de distintos colores para darle vida y alegría a tu look.", precio: 6900, stock: 25, stockCritico: 6, categoriaId: 4, imagen: "productos/diadema 1.jpeg", estado: "Activo" },
  { codigo: "CH-008", nombre: "Diadema Tonos Pastel", descripcion: "Diademas en suaves tonos pastel, frescas y femeninas.", precio: 6900, stock: 22, stockCritico: 6, categoriaId: 4, imagen: "productos/diadema2.jpeg", estado: "Activo" },
  { codigo: "CH-009", nombre: "Diadema Diseño Especial", descripcion: "Diadema con patrón característico y diseño diferencial.", precio: 7500, stock: 16, stockCritico: 5, categoriaId: 4, imagen: "productos/diadema4.jpeg", estado: "Activo" },
  { codigo: "CH-010", nombre: "Diadema Colores Vivos", descripcion: "Diadema con nuevo patrón y colores llamativos que no pasan desapercibidos.", precio: 7500, stock: 20, stockCritico: 5, categoriaId: 4, imagen: "productos/diadema5.jpg", estado: "Activo" },
  { codigo: "CH-011", nombre: "Llavero Perro Salchicha", descripcion: "Llavero divertido con figura de perro salchicha para acompañarte a todas partes.", precio: 4900, stock: 30, stockCritico: 8, categoriaId: 5, imagen: "productos/llavero1.jpg", estado: "Activo" },
  { codigo: "CH-012", nombre: "Llavero Salchicha Ternura", descripcion: "Llavero de perro salchicha en versión tierna, ideal para regalar.", precio: 4900, stock: 28, stockCritico: 8, categoriaId: 5, imagen: "productos/llavero2.jpg", estado: "Activo" },
  { codigo: "CH-013", nombre: "Pulsera Dios con Perlas", descripcion: "Pulsera con palabra \"Dios\" combinada con delicadas perlas.", precio: 9900, stock: 16, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera.jpg", estado: "Activo" },
  { codigo: "CH-014", nombre: "Pulsera Figuras", descripcion: "Pulsera con figuras decorativas que dan un toque único.", precio: 8900, stock: 18, stockCritico: 5, categoriaId: 2, imagen: "productos/pulsera2.jpg", estado: "Activo" },
  { codigo: "CH-015", nombre: "Pulsera Corazones", descripcion: "Pulsera adornada con corazones, romántica y delicada.", precio: 8900, stock: 20, stockCritico: 5, categoriaId: 2, imagen: "productos/pulsera3.jpg", estado: "Activo" },
  { codigo: "CH-016", nombre: "Pulsera Cuero y Figuras", descripcion: "Pulsera de cuero combinada con figuras, moderna y con carácter.", precio: 10900, stock: 12, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera4.jpg", estado: "Activo" },
  { codigo: "CH-017", nombre: "Pulsera Cuero Encanto", descripcion: "Pulsera de cuero con figuras y encanto casual.", precio: 10900, stock: 12, stockCritico: 4, categoriaId: 2, imagen: "productos/pulsera5.jpg", estado: "Activo" },
];

const NOTICIAS: Noticia[] = [
  {
    id: 1,
    titulo: "Guía de Tendencias: Accesorios de Primavera",
    resumen:
      "Conoce los tonos y materiales que marcarán la temporada. Desde piezas minimalistas hasta combinaciones audaces.",
    imagen: "blog/tendencias.svg",
    fecha: "2026-08-01",
    slug: "detalle-1",
    categoria: "Tendencias",
    autor: "Equipo Pink & Pink",
    parrafos: [
      "La primavera trae consigo colores vibrantes, texturas ligeras y combinaciones audaces que transforman cualquier atuendo básico en una declaración de estilo.",
      "En esta temporada, la tendencia principal se centra en el contraste entre acabados dorados y tonos pastel como el rosa suave y el lavanda. Los aros grandes y los collares en capas son los accesorios indispensables que no pueden faltar en tu colección.",
    ],
  },
  {
    id: 2,
    titulo: "Cómo Cuidar tus Joyas para que Cuenten Historias",
    resumen:
      "Consejos prácticos para limpiar y almacenar tus accesorios favoritos evitando el desgaste del día a día.",
    imagen: "blog/cuidado.svg",
    fecha: "2026-08-10",
    slug: "detalle-2",
    categoria: "Tips & Cuidado",
    autor: "Equipo Pink & Pink",
    parrafos: [
      "Mantener el brillo original de tus accesorios favoritos es más fácil de lo que parece con una rutina básica de cuidados.",
      "Te recomendamos evitar el contacto directo con perfumes, cremas o agua de mar. Al finalizar el día, guarda cada pieza por separado en un lugar seco utilizando bolsas de tela o joyeros para evitar ralladuras y mantener su acabado impecable por mucho más tiempo.",
    ],
  },
];

export function inicializarDatos() {
  const nuevaVersion = localStorage.getItem("chic_version") !== CHIC_VERSION;

  if (nuevaVersion || !localStorage.getItem(CHIC_KEYS.roles)) {
    localStorage.setItem(CHIC_KEYS.roles, JSON.stringify(ROLES));
  }
  if (nuevaVersion || !localStorage.getItem(CHIC_KEYS.categorias)) {
    localStorage.setItem(CHIC_KEYS.categorias, JSON.stringify(CATEGORIAS));
  }
  if (nuevaVersion || !localStorage.getItem(CHIC_KEYS.regiones)) {
    localStorage.setItem(CHIC_KEYS.regiones, JSON.stringify(REGIONES));
  }
  if (nuevaVersion || !localStorage.getItem(CHIC_KEYS.comunas)) {
    localStorage.setItem(CHIC_KEYS.comunas, JSON.stringify(COMUNAS));
  }
  if (!localStorage.getItem(CHIC_KEYS.usuarios)) {
    localStorage.setItem(CHIC_KEYS.usuarios, JSON.stringify(USUARIOS));
  }
  if (!localStorage.getItem(CHIC_KEYS.productos)) {
    localStorage.setItem(CHIC_KEYS.productos, JSON.stringify(PRODUCTOS));
  }
  if (!localStorage.getItem(CHIC_KEYS.blog)) {
    localStorage.setItem(CHIC_KEYS.blog, JSON.stringify(NOTICIAS));
  }
  if (!localStorage.getItem(CHIC_KEYS.carrito)) {
    localStorage.setItem(CHIC_KEYS.carrito, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHIC_KEYS.contactos)) {
    localStorage.setItem(CHIC_KEYS.contactos, JSON.stringify([]));
  }
  if (!localStorage.getItem(CHIC_KEYS.ordenes)) {
    localStorage.setItem(CHIC_KEYS.ordenes, JSON.stringify([]));
  }

  if (nuevaVersion) {
    localStorage.setItem("chic_version", CHIC_VERSION);
  }
}
