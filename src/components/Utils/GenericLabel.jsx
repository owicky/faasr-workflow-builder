export default function GenericLabel({ value, size }) {
    return (
        <div>
            <text style={{ fontSize : {size} }}>{value}</text>
        </div>
    );
}