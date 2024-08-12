import React, { useState } from "react";

  const CheckboxGroup = ({ items, onChange, selectedItems, setSelectedItems }) => {

  const handleCheckboxChange = (event) => {
    const { value } = event.target;

    if (selectedItems.includes(value)) {
      setSelectedItems(selectedItems.filter((item) => item !== value));
    } else {
      setSelectedItems([...selectedItems, value]);
    }

    // Call the parent component's onChange function
    onChange(selectedItems);
  };

  return (
    <div>
      {items.map((item) => (
        <label key={item.id}>
          <input
            type="checkbox"
            value={item.id}
            checked={selectedItems.includes(item.id)}
            onChange={handleCheckboxChange}
          />
          {item.name}
        </label>
      ))}
    </div>
  );
};

export default CheckboxGroup;
