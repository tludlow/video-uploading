import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { v4 } from "uuid";
import generateVideoThumbnail from "../utils/thumbnail";
import UploadIcon from "./icons/UploadIcon";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import DeleteIcon from "./icons/DeleteIcon";

interface Props {
  label: string;
}

interface PreviewFile extends FileWithPath {
  thumbnail: string;
  uploadProgress: number | undefined;
}

export default function UploadVideo({ label }: Props) {
  const [file, setFile] = useState<PreviewFile | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteToken, setDeleteToken] = useState<string | undefined>(undefined);

  const progressPercent = Math.round(uploadProgress * 100);

  const onDrop = useCallback(async (acceptedFiles: any) => {
    const acceptedFile = acceptedFiles[0];

    setFile({
      ...acceptedFile,
      thumbnail: await generateVideoThumbnail(acceptedFile),
    });

    const data = new FormData();
    data.append("file", acceptedFile);
    data.append("upload_preset", "video-upload-browser");
    data.append("public_id", v4());
    data.append("api_key", "539567675919287");

    try {
      const result = await axios.post(
        "https://api.cloudinary.com/v1_1/dfv8hufs2/video/upload",
        data,
        {
          onUploadProgress: (progress) => {
            console.log(
              `Progress for file: ${acceptedFile.path}: ${progress.progress}`
            );

            setUploadProgress(progress.progress ?? 0);
          },
        }
      );
      console.log(result);

      setDeleteToken(result.data.delete_token);
    } catch (error) {
      console.error("Error uploading the files!");
      console.error(error);
    }
  }, []);

  const onDelete = () => {
    setFile(undefined);
    setUploadProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      if (file) {
        URL.revokeObjectURL(file.thumbnail);
      }
    },
    [file]
  );

  const { getRootProps, getInputProps, inputRef } = useDropzone({
    onDrop,
    maxSize: 100000000,
    multiple: false,
    accept: {
      "video/mp4": [".mp4"],
    },
  });
  return (
    <>
      {file ? (
        <div className="relative">
          <img className="rounded-lg h-[125px]" src={file.thumbnail} />
          {uploadProgress < 1 && (
            <CircularProgressbar
              className="absolute h-20 w-20 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 stroke-white"
              value={progressPercent}
              text={`${progressPercent}%`}
            />
          )}
          {uploadProgress === 1 && (
            <button onClick={() => onDelete()}>
              <DeleteIcon className="h-8 w-8 text-white absolute top-1 right-1 hover:text-gray-400 cursor-pointer" />
            </button>
          )}
        </div>
      ) : (
        <div
          {...getRootProps()}
          className="p-6 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center space-y-2 cursor-pointer hover:border-dotted hover:bg-gray-100 h-[125px]"
        >
          <UploadIcon />
          <p>{label}</p>
        </div>
      )}

      <input {...getInputProps()} />
    </>
  );
}
