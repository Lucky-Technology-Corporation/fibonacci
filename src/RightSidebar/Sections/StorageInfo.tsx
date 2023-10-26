import { copyText } from "../../Utilities/Copyable";
import { getTableHelper } from "../../Utilities/TableHelper";
import InfoItem from "../../Utilities/Toast/InfoItem";

export default function StorageInfo({ show }: { show: boolean }) {
  const handleRowClick = (row: { name: string; description?: string }) => {
    copyText(row.name);
  };

  return (
    <>
      <div
        className={`flex-col items-center justify-between ${
          show ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
        }`}
        style={{ transition: "opacity 0.3s" }}
      >
        <InfoItem
          position="top-left"
          content={
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#D2D3E0"
                viewBox={`0 0 50 50`}
                width={`${14}px`}
                height={`${14}px`}
              >
                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
              </svg>
              <div className="ml-2 text-xs font-mono">saveFile</div>
            </>
          }
          toast={{
            title: "saveFile",
            isLarge: true,
            content: (
              <div className="text-gray-400">
                Save a file to storage. The url returned is the relative path (does not include your domain)
                {getTableHelper(
                  [
                    {
                      name: "const url = async saveFile(fileName, fileData, isPrivate)",
                      description: "Save a file. If isPrivate is true, the file must be signed with getFile to access",
                    },
                  ],
                  handleRowClick,
                )}
              </div>
            ),
          }}
        />
        <InfoItem
          position="top-left"
          content={
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#D2D3E0"
                viewBox={`0 0 50 50`}
                width={`${14}px`}
                height={`${14}px`}
              >
                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
              </svg>
              <div className="ml-2 text-xs font-mono">getFile</div>
            </>
          }
          toast={{
            title: "getFile",
            isLarge: true,
            content: (
              <div className="text-gray-400">
                Get the URL for a file in storage. The url returned is the relative path (does not include your domain)
                {getTableHelper(
                  [
                    {
                      name: "const url = async getFile(filename)",
                      description: "Get a signed url for the first file matching the filename",
                    },
                    {
                      name: "const signedUrl = async getFile(url)",
                      description: "Get a signed (publicly accessible) URL for a file",
                    },
                  ],
                  handleRowClick,
                )}
              </div>
            ),
          }}
        />
        <InfoItem
          position="top-left"
          content={
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="#D2D3E0"
                viewBox={`0 0 50 50`}
                width={`${14}px`}
                height={`${14}px`}
              >
                <path d="M 25 2 C 12.309295 2 2 12.309295 2 25 C 2 37.690705 12.309295 48 25 48 C 37.690705 48 48 37.690705 48 25 C 48 12.309295 37.690705 2 25 2 z M 25 4 C 36.609824 4 46 13.390176 46 25 C 46 36.609824 36.609824 46 25 46 C 13.390176 46 4 36.609824 4 25 C 4 13.390176 13.390176 4 25 4 z M 25 11 A 3 3 0 0 0 22 14 A 3 3 0 0 0 25 17 A 3 3 0 0 0 28 14 A 3 3 0 0 0 25 11 z M 21 21 L 21 23 L 22 23 L 23 23 L 23 36 L 22 36 L 21 36 L 21 38 L 22 38 L 23 38 L 27 38 L 28 38 L 29 38 L 29 36 L 28 36 L 27 36 L 27 21 L 26 21 L 22 21 L 21 21 z" />
              </svg>
              <div className="ml-2 text-xs font-mono">deleteFile</div>
            </>
          }
          toast={{
            title: "deleteFile",
            isLarge: true,
            content: (
              <div className="text-gray-400">
                Delete a specific file
                {getTableHelper(
                  [
                    {
                      name: "async deleteFile(filename)",
                      description: "Deletes the first file matching the filename",
                    },
                    {
                      name: "async deleteFile(url)",
                      description: "Deletes the file at the provided url",
                    },
                  ],
                  handleRowClick,
                )}
              </div>
            ),
          }}
        />
      </div>
    </>
  );
}
