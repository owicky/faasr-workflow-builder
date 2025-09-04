export default function GenericLabel({ value, size, required }) {
    return (
        <div className="generic-label">
            
            <p style={{ fontSize : size }}>
                {required ? <span style={{ color: 'red' }}>* </span> : <></>}
                {value}
            </p>
        </div>
    );
}
