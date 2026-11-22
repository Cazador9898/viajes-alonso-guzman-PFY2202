/**
 * Servidor GraphQL mock real (graphql-js). Se consulta con POST /graphql.
 * Los registros son simulados y se comparten con el mock REST en viajes.json.
 */
import { graphql, buildSchema } from 'graphql';
import { readFileSync } from 'node:fs';

export const travelData = JSON.parse(readFileSync(new URL('./data/viajes.json', import.meta.url), 'utf8'));

export const travelSchema = buildSchema(`
  type Destino {
    id: ID!
    ciudad: String!
    pais: String!
    continente: String!
    descripcion: String!
    actividades: [String!]!
    emoji: String!
    color: String!
    mejorTemporada: String!
    diasSugeridos: Int!
  }

  type Vuelo {
    id: ID!
    destinoId: ID!
    aerolinea: String!
    origen: String!
    destino: String!
    fechaSalida: String!
    fechaRegreso: String!
    precioCLP: Int!
    asientosDisponibles: Int!
    duracion: String!
  }

  type Hotel {
    id: ID!
    destinoId: ID!
    nombre: String!
    ubicacion: String!
    estrellas: Int!
    precioNocheCLP: Int!
    habitacionesDisponibles: Int!
    fechaEntrada: String!
    fechaSalida: String!
    servicios: [String!]!
  }

  type Query {
    destinos: [Destino!]!
    destino(id: ID!): Destino
    vuelos(destinoId: ID!): [Vuelo!]!
    hoteles(destinoId: ID!): [Hotel!]!
  }
`);

export const travelResolvers = {
  destinos: () => travelData.destinos,
  destino: ({ id }) => travelData.destinos.find(item => item.id === id) ?? null,
  vuelos: ({ destinoId }) => travelData.vuelos.filter(item => item.destinoId === destinoId),
  hoteles: ({ destinoId }) => travelData.hoteles.filter(item => item.destinoId === destinoId),
};

/** GraphQL valida el esquema, los campos solicitados y las variables recibidas. */
export function executeTravelGraphQL({ query, variables, operationName }) {
  return graphql({
    schema: travelSchema,
    source: query,
    rootValue: travelResolvers,
    variableValues: variables,
    operationName,
  });
}
