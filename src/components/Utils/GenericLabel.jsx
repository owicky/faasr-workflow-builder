export default function GenericLabel({ value, size }) {
    return (
        <div>
            <p style={{ fontSize : size }}>{value}</p>
        </div>
    );
}