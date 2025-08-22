export default function GenericLabel({ value, size }) {
    return (
        <div className="generic-label">
            <p style={{ fontSize : size }}>{value}</p>
        </div>
    );
}