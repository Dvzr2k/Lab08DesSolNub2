import { createPool } from "mysql2/promise";

export const pool = createPool({
  host: "aws.connect.psdb.cloud",
  user: "kgn96qxme6o2u5yq90q9",
  password: "pscale_pw_xy6NipEJWtLk6FMEkMFphLA1B1Fydh1EX3c58uejEQy",
  database: "productsdb",
  ssl: {
    rejectUnauthorized: false
  }
});
