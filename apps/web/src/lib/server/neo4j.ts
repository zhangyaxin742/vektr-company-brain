import "server-only";

import neo4j from "neo4j-driver";

type Neo4jConfig = {
  uri: string;
  username: string;
  password: string;
};

export function createNeo4jDriver({ uri, username, password }: Neo4jConfig) {
  return neo4j.driver(uri, neo4j.auth.basic(username, password));
}
