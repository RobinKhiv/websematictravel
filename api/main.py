from fastapi import FastAPI
from rdflib import Graph

app = FastAPI()


@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/sparql")
async def sparql():
# Create a Graph, parse in Internet data
    g = Graph().parse("http://www.w3.org/People/Berners-Lee/card")

# Query the data in g using SPARQL
# This query returns the 'name' of all ``foaf:Person`` instances
    q = """
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>

        SELECT ?name
        WHERE {
            ?p rdf:type foaf:Person .

            ?p foaf:name ?name .
        }
    """

# Apply the query to the graph and iterate through results
    for r in g.query(q):
        print(r["name"])
# prints: Timothy Berners-Lee
