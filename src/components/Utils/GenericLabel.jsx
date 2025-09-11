export default function GenericLabel({ value, size, required, children }) {
    return (
        <div 
            className="generic-label" 
            style={{ display: "flex", alignItems: "center", gap: "8px", margin: 0 }}
        >
            <span style={{ fontSize: size }}>
                {required ? <span style={{ color: "red" }}>* </span> : null}
                {value}
            </span>
            {children}
        </div>
    );
}
