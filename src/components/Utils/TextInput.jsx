import GenericLabel from "./GenericLabel";

export default function TextInput({ value, onChange, placeholder }) {
    return (
        <div>
            <input 
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}