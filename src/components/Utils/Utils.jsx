

// Utilities for modifying nodes and edges
const useUtils = () => {
    
        // DFS cycle check from https://www.geeksforgeeks.org/dsa/detect-cycle-in-a-graph/

    // Helper function to perform DFS and detect cycle
    function isCyclicUtil(adj, u, visited, recStack)
    {
        // If node is already in the recursion stack, cycle
        // detected
        if (recStack[u]){
            return true;
        }

        // If node is already visited and not in recStack, no
        // need to check again
        if (visited[u])
            return false;

        // Mark the node as visited and add it to the recursion
        // stack
        visited[u] = true;
        recStack[u] = true;

        // Recur for all neighbors of the current node
        for (let v of adj[u]) {
            if (isCyclicUtil(adj, v, visited, recStack)){
                
                
                return true; // If any path leads to a cycle,
                                // return true
            }
        }

        // Backtrack: remove the node from recursion stack
        recStack[u] = false;
        return false; // No cycle found in this path
    }

    // Function to construct adjacency list from edge list
    function constructadj(V, edges)
    {
        let adj = Array.from(
            {length : V},
            () => []); // Create an empty list for each vertex
        for (let [u, v] of edges) {
            adj[u].push(v); // Add directed edge from u to v
        }
        return adj;
    }

    // Main function to detect cycle in directed graph
    const isCyclic = (V, edges) =>
    {
        let adj
            = constructadj(V, edges); // Build adjacency list
        let visited
            = new Array(V).fill(false); // Track visited nodes
        let recStack
            = new Array(V).fill(false); // Track recursion stack


        // Check each vertex (for disconnected components)
        for (let i = 0; i < V; i++) {
            if (!visited[i] && isCyclicUtil(adj, i, visited, recStack))
              return true; // Cycle found
        }

        return false; // No cycle detected
    }

    // Cycle detection 
    const cycleDetection = (nds, eds) => {

        const V = nds.length

        const dfsEdges = eds.map( (edge) => [nds.findIndex( (node) => (node.id === edge.source) ), nds.findIndex( (node) => (node.id === edge.target) )])
        const cycleDetected = isCyclic(V, dfsEdges)
        if (cycleDetected) alert("Cycle Detected!")
        return(cycleDetected); 
    }


    return {
        cycleDetection
    };

}

export default useUtils
