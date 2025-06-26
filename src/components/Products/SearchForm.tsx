import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, InputGroup, Button, FormControl } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SearchForm: React.FC = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search/${query}`);
      setQuery("");
    }
  };

  return (
    <Form onSubmit={handleSubmit} style={{ width: "290px" }} className="d-flex">
      <InputGroup>
        <FormControl
          size="sm"
          type="text"
          placeholder="Search store..."
          aria-label="Search store"
          value={query}
          className="border-0"
          onChange={e => setQuery(e.target.value)}
        />
        <Button
          variant="outline-secondary"
          size="sm"
          className="bg-white text-dark"
          type="submit"
        >
          <FontAwesomeIcon icon="search" />
        </Button>
      </InputGroup>
    </Form>
  );
};

export default SearchForm;