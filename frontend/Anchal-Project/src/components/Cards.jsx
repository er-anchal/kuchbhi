import React from 'react'

const Cards = ({card}) => {
  return (
    <div className="card">
        <h3>{card.name}</h3>
        <p>{card.desc}</p>
    </div>
  )
}

export default Cards