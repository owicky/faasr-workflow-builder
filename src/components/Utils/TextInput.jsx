export default function TextInput({ prompt, value, onChange, placeholder }) {
    return (
        <div>
            <button>{prompt}</button>
            <input 
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={onChange}
            />
        </div>
    );
}