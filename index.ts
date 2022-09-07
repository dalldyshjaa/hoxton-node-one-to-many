import express from "express";
import cors from "cors";
import Database from "better-sqlite3";

const app = express();
const db = Database("./db/data.db", { verbose: console.log });
const port = 3000;

app.use(cors());
app.use(express.json());

// Data

const museums = [
  {
    name: "Kosovo Museum",
    city: "Pristina",
  },
  {
    name: "Louvre Museum",
    city: "Paris",
  },
  {
    name: "The British Museum",
    city: "London",
  },
];

const works = [
  {
    name: "Hyjnesha Ne Fron",
    picture:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Hyjnesha_muze.jpg/306px-Hyjnesha_muze.jpg",
    museumID: 1,
  },
  {
    name: "Mona Lisa",
    picture:
      "https://media.npr.org/assets/img/2012/02/02/mona-lisa-copy_custom-cf935c261c640b9ff7e214059a0328c880c22f50-s1100-c50.jpg	",
    museumID: 2,
  },
  {
    name: "Saint Sebastian",
    picture:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Andrea_Mantegna_088.jpg/200px-Andrea_Mantegna_088.jpg	",
    museumID: 2,
  },
  {
    name: "The Lycurgus Cup",
    picture:
      "https://www.britishmuseum.org/sites/default/files/styles/uncropped_huge/public/2019-10/lycurgus-cup-rome-british-museum.jpg	",
    museumID: 3,
  },
];

// Database function

const createMuseumTable = db.prepare(
  "CREATE TABLE IF NOT EXISTS museums (id INTEGER NOT NULL, name TEXT NOT NULL, city TEXT NOT NULL, PRIMARY KEY (id));"
);

const createWorkTable = db.prepare(
  "CREATE TABLE IF NOT EXISTS works (id INTEGER NOT NULL, name TEXT NOT NULL, picture TEXT NOT NULL, museumID INTEGER NOT NULL, FOREIGN KEY (museumID) REFERENCES museums (id), PRIMARY KEY (id));"
);

const deleteMuseumsTable = db.prepare(`DELETE FROM museums;`);
const deleteWorksTable = db.prepare(`DELETE FROM works;`);
deleteMuseumsTable.run();
deleteWorksTable.run();

const createMuseum = db.prepare(
  `INSERT INTO museums (name, city) VALUES (@name, @city);`
);

const createWork = db.prepare(
  `INSERT INTO works (name, picture, museumID) VALUES (@name, @picture, @museumID);`
);

const getMuseums = db.prepare(`SELECT * FROM museums;`);

const getMuseum = db.prepare(`SELECT * FROM museums WHERE id = @id;`);

const getWorks = db.prepare(`SELECT * FROM works;`);

const getWork = db.prepare(`SELECT * FROM works WHERE id = @id`);

const getWorksByMuseumId = db.prepare(
  `SELECT * FROM works WHERE museumID = @museumID`
);

createMuseumTable.run();
createWorkTable.run();

// Insert default data

for (let museum of museums) {
  createMuseum.run({ name: museum.name, city: museum.city });
}

for (let work of works) {
  createWork.run({
    name: work.name,
    picture: work.picture,
    museumID: work.museumID,
  });
}

// Routes

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/museums", (req, res) => {
  const museums = getMuseums.all();

  res.send(museums);
});

app.get("/museums/:id", (req, res) => {
  const museum = getMuseum.get({ id: Number(req.params.id) });

  if (museum) {
    res.send(museum);
  } else {
    res.status(404).send({ error: "Not Found" });
  }
});

app.get("/works", (req, res) => {
  const works = getWorks.all();

  res.send(works);
});

app.get("/works/:id", (req, res) => {
  const work = getWork.get({ id: Number(req.params.id) });

  if (work) {
    res.send(work);
  } else {
    res.status(404).send({ error: "Not Found" });
  }
});

app.get("/museums/:id/works", (req, res) => {
  const works = getWorksByMuseumId.all({ museumID: Number(req.params.id) });

  if (works.length) {
    res.send(works);
  } else {
    res.send({ message: "Museum Not Found Or It Has No Works" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
