import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import Card from '../components/Cards.jsx'
import Form from '../components/Form.jsx'

const Home = () => {
    const [cards, setCards] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:5000/cards")
            .then(res => setCards(res.data))
            .catch(err => console.log(err));
    }, []);

    //   const handleCreate = async (name, desc) => {
    //     try {
    //       const { data } = await axios.post("http://localhost:5000/cards", { name, desc });
    //       setCards(prev => [...prev, data]);
    //     } catch (err) {
    //       console.error("Error posting card:", err);
    //     }
    //   };
    const handleCreate = async (name, desc) => {
        try {
            const { data } = await axios.post("http://localhost:5000/cards", { name, desc });
            setCards(prev => [...prev, data]);
        } catch (err) {
            console.error("Error posting card:", err);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>Name Cards (Simple MERN CRUD)</h1>

            <Form onCreate={handleCreate} />

            <hr />
            <div className='cardContainer'>
                {cards.map(card => (
                    <Card
                        key={card._id}
                        card={card}
                    />
                ))}
            </div>

        </div>
    )
}

export default Home