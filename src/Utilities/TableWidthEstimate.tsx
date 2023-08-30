  export const getEstimatedColumnWidth = (numColumns: number, columnName: string = "") => {
    var MIN_COLUMN_WIDTH = 120;
    const columnNameWidth = columnName.length * 10;
    if (columnNameWidth > MIN_COLUMN_WIDTH) {
      MIN_COLUMN_WIDTH = columnNameWidth;
    }

    const estimate = (window.innerWidth - 220 - 60)/numColumns;
    if (estimate < MIN_COLUMN_WIDTH) {
      return MIN_COLUMN_WIDTH;
    } else {
      return estimate;
    }
  }
