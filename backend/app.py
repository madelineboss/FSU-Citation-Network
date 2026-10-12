from pathlib import Path
import pandas as pd
import networkx as nx
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)                                   # required: frontend is a different origin

CSV = Path(__file__).parent / "data" / "paper_citation_links_within_fsu.csv"

def build_network():
    df = pd.read_csv(CSV, dtype=str)        # ids as strings
    df = df[df["source"] != df["target"]]
    links = (df.groupby(["source", "target"]).size()
               .reset_index(name="value"))

    # group = connected component, so the "hundreds of components" show up in the data
    G = nx.from_pandas_edgelist(links, "source", "target")
    group_of = {}
    for i, comp in enumerate(nx.connected_components(G)):
        for n in comp:
            group_of[n] = i

    node_ids = pd.unique(pd.concat([links["source"], links["target"]]))
    nodes = [{"id": str(n), "group": group_of[n]} for n in node_ids]
    links_out = [{"source": str(r.source), "target": str(r.target), "value": int(r.value)}
                 for r in links.itertuples()]
    return {"nodes": nodes, "links": links_out}

NETWORK = build_network()                   # load once on the server

@app.get("/api/network")
def network():
    return jsonify(NETWORK)

if __name__ == "__main__":
    app.run(port=5001, debug=True)