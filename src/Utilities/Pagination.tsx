import { faArrowLeft, faArrowRight, faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef } from "react";

interface PaginationProps {
  currentPage: number;
  totalDocs?: number;
  itemsPerPage?: number;
  handlePageChange: (page: number) => void;
  handleRefresh: () => void;
}

const Pagination = ({
  currentPage,
  totalDocs,
  itemsPerPage = 20,
  handlePageChange,
  handleRefresh,
}: PaginationProps) => {
  const startDocument = currentPage * itemsPerPage + 1;

  var isLastPage = false;
  var endDocument = (currentPage + 1) * itemsPerPage;

  if (totalDocs) {
    isLastPage = Math.ceil(totalDocs / itemsPerPage) === currentPage + 1;
    endDocument = isLastPage ? totalDocs : (currentPage + 1) * itemsPerPage;
  }

  const btnStyles =
    "inline-flex items-center justify-center gap-x-1.5 rounded-md px-3 h-7 text-sm font-semibold shadow-sm bg-[#85869833] hover:bg-[#85869855] ring-1 ring-inset ring-[#525363] mx-2";

  const refreshSpinner = useRef(null);
  const spin = () => {
    const spinner = refreshSpinner.current;
    if (spinner) {
      spinner.classList.add("spin-rotate");
      setTimeout(() => {
        spinner.classList.remove("spin-rotate");
      }, 500);
    }
  };

  return totalDocs ? (
    <div className="flex items-center">
      {currentPage >= 1 && (
        <button className={btnStyles} onClick={() => handlePageChange(currentPage - 1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      <span className="mx-2">{`${startDocument} – ${endDocument} of ${totalDocs}`}</span>
      {!isLastPage && (
        <button className={btnStyles} onClick={() => handlePageChange(currentPage + 1)}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
      <button
        className={btnStyles}
        onClick={() => {
          spin();
          handleRefresh();
        }}
      >
        <FontAwesomeIcon icon={faArrowsRotate} ref={refreshSpinner} />
      </button>
    </div>
  ) : (
    <div className="flex items-center">
      {currentPage >= 1 && (
        <button className={btnStyles} onClick={() => handlePageChange(currentPage - 1)}>
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      )}
      <span className="mx-2">{`${startDocument} - ${endDocument}`}</span>
      {!isLastPage && (
        <button className={btnStyles} onClick={() => handlePageChange(currentPage + 1)}>
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      )}
      <button
        className={btnStyles}
        onClick={() => {
          spin();
          handleRefresh();
        }}
      >
        <FontAwesomeIcon icon={faArrowsRotate} ref={refreshSpinner} />
      </button>
    </div>
  );
};

export default Pagination;
