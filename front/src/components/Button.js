import PropTypes from 'prop-types';

const Button = ({ color, text, onClick }) => {
    return (
        <button className='btn' onClick={onClick} style={{ backgroundColor: color }}>
            {text}
        </button>
    )
}

Button.protoTypes = { 
    color: PropTypes.string,
    text: PropTypes.string,
    onClick: PropTypes.func 
}

export default Button;