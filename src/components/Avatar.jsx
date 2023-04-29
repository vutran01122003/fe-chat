function Avatar(props) {
    const colors = ['bg-pink-300', 'bg-green-300', 'bg-red-300', 'bg-purple-300', 'bg-teal-300', 'bg-yellow-300'];
    const base10 = parseInt(props.userId, 16);
    const colorIndex = base10 % colors.length;
    const color = colors[colorIndex];
    return ( 
        <div className={"w-8 h-8 rounded-full flex items-center justify-center relative " + color}>
            <span className="opacity-70 ">{props.username.split('')[0]}</span>
            {props.online && <span className="w-3 h-3 border-2 border-color-white bg-green-500 bottom-0 right-0 absolute rounded-full"></span>}
            {!props.online && <span className="w-3 h-3 border-2 border-color-white bg-gray-500 bottom-0 right-0 absolute rounded-full"></span>}
        </div>
    );
}

export default Avatar;