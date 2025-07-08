
export default function VisibleGraph(props){


    if(props.visible){
        return(
            <div id="nodes-edges-panel" style={{width: '15vw', height: '100%'}}>NODES<pre>{JSON.stringify(props.nodes, null, 2) }</pre>EDGES<pre>{JSON.stringify(props.edges, null, 2) }</pre></div>
        )
    }else{
        return (<></>)
    }
}



