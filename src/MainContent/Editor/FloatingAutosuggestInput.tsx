import { useState } from "react";
import Autosuggest from "react-autosuggest";
import { prelineComponents } from "./HeaderDocOptions";

export default function FloatingAutosuggestInput({
  position: { x, y },
  isVisible,
}: {
  position: { x: number; y: number };
  isVisible: boolean;
}) {
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState(prelineComponents);

  const onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {};

  const renderSuggestionsContainer = ({ containerProps, children, query }) => (
    <div
      {...containerProps}
      className={`absolute top-${y} left-${x} mr-8 z-50 overflow-scroll bg-[#252629] border border-[#68697a] rounded mt-2 p-0 ${
        (query.length == 0 || suggestions.length == 0) && "hidden"
      }`}
    >
      {children}
    </div>
  );

  const renderSuggestion = (suggestion, { query, isHighlighted }) => {};

  const getSuggestionValue = (suggestion) => suggestion.title;

  const onSuggestionsClearRequested = () => {
    setSuggestions(prelineComponents);
  };

  const onSuggestionsFetchRequested = ({ value }) => {
    const docs = prelineComponents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(value.toLowerCase()) ||
        doc.description.toLowerCase().includes(value.toLowerCase()),
    );
    setSuggestions([...docs]);
  };

  if (!isVisible) return <></>;

  return (
    <Autosuggest
      suggestions={suggestions}
      onSuggestionsFetchRequested={onSuggestionsFetchRequested}
      onSuggestionsClearRequested={onSuggestionsClearRequested}
      getSuggestionValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      renderSuggestionsContainer={renderSuggestionsContainer}
      onSuggestionSelected={onSuggestionSelected}
      shouldRenderSuggestions={() => {
        return true;
      }}
      highlightFirstSuggestion={false}
      // onSuggestionHighlighted={({ suggestion }) => {
      //   setHighlighted(true)
      // }}
      inputProps={{
        placeholder: `Search for drop-in code...`,
        value: prompt,
        onChange: (e) => setPrompt(e.target.value),
        className:
          "grow mx-2 ml-0 mr-0 bg-[#252629] border-[#525363] border rounded font-sans text-sm font-normal outline-0 focus:bg-[#28273c] focus:border-[#4e52aa] p-1.5",
        style: {
          width: "calc(100% - 1rem)",
        },
      }}
      className="ml-0 mr-0 grow"
    />
  );
}
