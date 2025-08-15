import { GrDocumentMissing } from "react-icons/gr";
import GenericLabel from "./GenericLabel";

export default function GenericButton( props ) {
    const src = props.icon ? props.icon : <GrDocumentMissing />

    return props.icon ? 
    (
        <div onClick={props.onClick} className="generic-button">
            {src}
            <GenericLabel value={props.children} size="15px"> </GenericLabel>
        </div> 
    ):(
        <div onClick={props.onClick} className="generic-button">
            {src}
            <GenericLabel value={props.children} size="15px"> </GenericLabel>
        </div>    
    )
}