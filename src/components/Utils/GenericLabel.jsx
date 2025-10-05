export default function GenericLabel({ value, size, required, children }) {
    return (
        <div 
            className="generic-label" 
        >
            <span style={{ fontSize: size }}>
                {required ? <span style={{ color: "red" }}>* </span> : null}
                {value}
            </span>
            {children}
        </div>
    );
}
