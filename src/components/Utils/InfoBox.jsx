import { useState, useEffect } from "react";

export default function InfoBox({ object, properties, forceKey }) {
    const [ selectKey, setSelectKey] = useState(() => Object.keys(object)[0]);

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

    return (!selectKey) ? null : (
    <>

        <div className="info-panel">
            <div>
                {
                    Object.keys(object).length > 1 ? 
                    <select
                    style={{ right: 200 }}
                    onChange={(e) => setSelectKey(e.target.value)}
                    value={selectKey}
                    id="compute-server-select"
                    >
                        {Object.entries(object).map(([key]) => (
                            <option key={key} value={key}>
                            {key}
                            </option>
                        ))}
                    </select>
                    : <button>{selectKey}</button>
                }
                { properties ? properties.map((key) => {
                    
                        return getJSX(key, object[selectKey]?.[key])
                    
            }) : 
                    Object.keys(object[selectKey]).map( key => (
                        <div key={key} style={{ marginBottom: "4px" }}>
                            <strong>{key}:</strong> {JSON.stringify(object[selectKey]?.[key])}
                        </div>
                    ))
                }
            </div>
        </div>
    </>
    );
}
