export default function Popup(props) {
    return (props.enabled) ? ( 
        <div className="popup">
            <div style={{backgroundColor : "#f2f2f2", flex: "1", borderRadius : "10px", padding: "5px"}}>
                {props.children}
                
            
            </div>
            <button style={{ position: "absolute", bottom : "10px", left : "50%", transform : "translateX(-50%)"}} onClick={() => {props.setEnabled(false); if (props.onClose) {props.onClose()}}}>Close</button>
        </div>
    ) : <></>
}