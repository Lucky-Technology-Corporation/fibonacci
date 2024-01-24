import { faFont, faICursor, faImage, faLineChart, faObjectUngroup, faTable } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import CategoryLabel from "./CategoryLabel";

export default function CategoryList({ handleDragStart, handleDragEnd }: { handleDragStart: any; handleDragEnd: any }) {
  const [isShowingCategory, setIsShowingCategory] = useState("");

  return (
    <>
      <CategoryLabel
        name="Text"
        icon={<FontAwesomeIcon icon={faFont} className="w-3 h-3 my-auto" />}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
      <CategoryLabel
        name="Container"
        icon={<FontAwesomeIcon icon={faObjectUngroup} className="w-3 h-3 my-auto" />}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
      <CategoryLabel
        name="Media"
        icon={<FontAwesomeIcon icon={faImage} className="w-3 h-3 my-auto" />}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
      <CategoryLabel
        name="Input"
        icon={<FontAwesomeIcon icon={faICursor} className="w-3 h-3 my-auto" />}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
      <CategoryLabel
        name="Table"
        icon={<FontAwesomeIcon icon={faTable} className="w-3 h-3 my-auto" />}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
      <CategoryLabel
        name="Chart"
        icon={<FontAwesomeIcon icon={faLineChart} className="w-3 h-3 my-auto" />}
        handleDragStart={handleDragStart}
        handleDragEnd={handleDragEnd}
      />
    </>
  );
}
