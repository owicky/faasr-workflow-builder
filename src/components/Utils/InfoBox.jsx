import { useState, useEffect } from "react";

export default function InfoBox({ object, properties, forceKey }) {
    const [ selectKey, setSelectKey] = useState(undefined);

    useEffect(() => {
        setSelectKey(Object.keys(object)[0]);
    }, [object]);

    
    useEffect(() => {
        setSelectKey(forceKey);
    }, [forceKey]);

    const getJSX = ( key, obj) => {
        if (typeof obj === 'object'){
            return (
                <div style={{border : "ridge"}}>
                    {Object.keys(obj).map( keys => (
                        <div key={keys} style={{ marginBottom: "4px" }}>
                            <strong>{keys}:</strong> {JSON.stringify(obj[keys])}
                        </div>
                    ))}
                </div>
                    
            )
        }else{
            return (
                <div key={key} style={{ marginBottom: "4px" }}>
                    <strong>{key}:</strong> {obj}
                </div>
            )
        }
    }
    return (!selectKey && !Object.keys(object)[0]) ? <div>INVALID</div> : (
    <>
        <div className="info-panel">
            <div>
                { 
                    <select
                    style={{ right: 200 }}
                    onChange={(e) => setSelectKey(e.target.value)}
                    value={selectKey?? Object.keys(object)[0]}
                    id="compute-server-select"
                    >
                        {Object.entries(object).map(([key]) => (
                            <option key={key} value={key}>
                            {key}
                            </option>
                        ))}
                    </select>
                }
                { properties ? properties.map((key) => {
                    return getJSX(key, object[selectKey??Object.keys(object)[0]]?.[key])
                    
            }) : 
                    Object.keys(object[
                        selectKey in object ?
                            selectKey:
                            Object.keys(object)[0]
                        ]).map( key => (
                        <div key={key} style={{ marginBottom: "4px" }}>
                            <strong>{key}:</strong> {JSON.stringify(object[selectKey??Object.keys(object)[0]]?.[key])}
                        </div>
                    )) 
                }
            </div>
        </div>
    </>
    );
}
