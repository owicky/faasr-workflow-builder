export default function TextInput({ value, onChange, placeholder, ...otherProps }) {
    return (
        <div>
            <input 
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                {...otherProps}
            />
        </div>
    );
}
