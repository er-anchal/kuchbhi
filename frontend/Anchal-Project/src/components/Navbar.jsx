import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
    return (
        <div className='nav'>
            <h3>Anchal the Fool</h3>
            <div>
                <Link to='/'>Home</Link>
                <Link to='/signup'>Signup</Link>
                <Link to='/login'>Login</Link>
            </div>
        </div>
    )
}

export default Navbar