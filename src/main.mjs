import Database from 'better-sqlite3';
import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

const db = new Database('./db/base-de-datos.db')
db.pragma('journal_mode = WAL');

// Exec executa a consulta de xeito inmediato.
db.exec(` 
    CREATE TABLE
        IF NOT EXISTS
        tareas(
            id INTEGER PRIMARY KEY,
            descripcion TEXT NOT NULL,
            completada BOOLEAN NOT NULL
        )
`);

const obtenTarefa = db.prepare('SELECT id, descripcion, completada FROM tareas WHERE id = ?')
const obterTodasAsTarefas = db.prepare('SELECT id, descripcion, completada FROM tareas')
const insertaTarefa = db.prepare('INSERT INTO tareas(id, descripcion, completada) VALUES (?, ?, ?)')
const actualizarTarefa = db.prepare('UPDATE tareas SET descripcion = ?, completada = ? WHERE id = ?')
const eliminaTarefa = db.prepare('DELETE FROM tareas WHERE id = ?')

app.get("/tarefa/", (peticion, respuesta)=>{
    if (peticion.query.id) {
        try {
            // Ejemplo de consulta para obter unha tarefa específica
            const tarefa = obtenTarefa.get(peticion.query.id)
            const JSONtarea = tarefa ? JSON.stringify(tarefa) : ""
            respuesta.status(tarefa ? 200 : 404)
            respuesta.send(JSONtarea)
        } catch (error) {
            console.error(error)
            respuesta.status(500)
            respuesta.send(`Error accediendo a la base de datos.
            Consulta la consola del backend para más información`)
        }
    } else {
        try {
            // Ejemplo de consulta para obter múltiples tarefas
            const tarefas = obterTodasAsTarefas.all()
            const JSONdatos = JSON.stringify(tarefas)
            respuesta.status(200)
            respuesta.send(JSONdatos)
        } catch (error) {
            console.error(error)
            respuesta.status(500)
            respuesta.send(`Error accediendo a la base de datos.
            Consulta la consola del backend para más información`)
        }
    }
})

app.post("/tarefa/", (peticion, respuesta)=>{
    try {
        const { id, descripcion, completada } = peticion.body
        insertaTarefa.run(id, descripcion, completada)
        respuesta.status(200)
        respuesta.send("Ok")
    } catch (error) {
        console.error(error) 
        respuesta.status(500)
        respuesta.send(`Error accediendo a la base de datos.
        Consulta la consola del backend para más información`)
    }
})

app.put("/tarefa/", (peticion, respuesta)=>{
    try {
        const { id, descripcion, completada } = peticion.body
        actualizarTarefa.run( descripcion, completada, id )
        respuesta.status(200)
        respuesta.send("Ok")
    } catch (error) {
        console.error(error)
        respuesta.status(500)
        respuesta.send(`Error accediendo a la base de datos.
        Consulta la consola del backend para más información`)
    }
})

app.delete("/tarefa/", (peticion, respuesta)=>{
    try {
        eliminaTarefa.run(peticion.body.id)
        respuesta.status(200)
        respuesta.send("Ok")
    } catch (error) {
        console.error(error) 
        respuesta.status(500)
        respuesta.send(`Error accediendo a la base de datos.
        Consulta la consola del backend para más información`)
    }
})

app.listen( 8000,()=>{
    console.log("Express traballando...");
})
