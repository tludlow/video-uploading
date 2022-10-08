import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import { z } from "zod";
import generateVideoThumbnail from "../utils/thumbnail";
import axios from "axios";

const chatFormSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Your chat title should have at least 10 characters" }),
  videos: z.any(),
});

interface PreviewFile extends FileWithPath {
  thumbnail: string;
  uploadProgress: number | undefined;
}

export default function ChatForm() {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [filesUploading, setFilesUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    resolver: zodResolver(chatFormSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Submitting form with the following data:");
    console.log(data);
  };

  const onDrop = useCallback(async (acceptedFiles: any) => {
    let filesToSet = [];
    for (const file of acceptedFiles) {
      filesToSet.push({
        ...file,
        thumbnail: await generateVideoThumbnail(file),
        uploadProgress: 0,
      });

      setFiles(filesToSet);
    }

    setFilesUploading(true);
    try {
      const results = await axios.all(
        acceptedFiles.map((file: FileWithPath) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "video-upload-browser");
          data.append("public_id", v4());
          data.append("api_key", "539567675919287");

          return axios.post(
            "https://api.cloudinary.com/v1_1/dfv8hufs2/video/upload",
            data,
            {
              onUploadProgress: (progress) => {
                console.log(
                  `Progress for file: ${file.path}: ${progress.progress}`
                );

                setFiles((files) =>
                  files.map((localFile) => {
                    if (file.path === localFile.path) {
                      return {
                        ...localFile,
                        uploadProgress: progress.progress,
                      };
                    }

                    return localFile;
                  })
                );
              },
            }
          );
        })
      );

      console.log(results);
      setFilesUploading(false);
    } catch (error) {
      console.error("Error uploading the files!");
      console.error(error);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100000000,
    multiple: true,
    accept: {
      "video/mp4": [".mp4"],
    },
  });

  const deleteFile = (fileToDelete: PreviewFile) => {
    const filesToKeep = files.filter((file) => fileToDelete.path !== file.path);
    setFiles(filesToKeep);
  };

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.thumbnail));
    },
    [files]
  );

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="m-12 space-y-8 max-w-lg border border-gray-300 p-6 border-lg"
      >
        <h1 className="text-xl font-bold">New live chat</h1>

        <div>
          <label
            htmlFor="title"
            className="block font-medium text-gray-700 text-lg"
          >
            Title
          </label>
          {errors.title?.message && (
            <p className="text-red-500 text-sm">
              {errors.title?.message.toString()}
            </p>
          )}
          <div className="mt-1">
            <input
              type="text"
              id="title"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder:text-gray-400"
              placeholder="you@example.com"
              {...register("title")}
            />
          </div>
        </div>

        <div
          {...getRootProps()}
          className="p-6 border-2 border-dashed border-gray-300 rounded-lg flex justify-center cursor-pointer hover:border-dotted hover:bg-gray-100"
        >
          <div>{isDragActive && <p>Drag them here!</p>}</div>
          <div className="flex items-center space-x-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
            <p className="text-gray-600">
              Drag your files here or click to upload
            </p>
          </div>
          <input {...getInputProps()} {...register("videos")} />
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Uploaded files</p>
            <div className="grid grid-cols-2 gap-x-4 mt-2">
              {files.map((file) => (
                <div key={file.path}>
                  <p className="font-bold text-sm text-gray-600 truncate">
                    {file.path}
                  </p>
                  <img
                    src={file.thumbnail}
                    onClick={() => deleteFile(file)}
                    className="rounded-lg"
                  />
                  {file.uploadProgress && (
                    <div className="mt-1 w-full bg-gray-200 rounded dark:bg-gray-700">
                      <div
                        className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded"
                        style={{ width: `${file.uploadProgress * 100}%` }}
                      >
                        {Math.round(file.uploadProgress * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={filesUploading}
          className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-500 hover:shadow w-full mt-4 disabled:cursor-not-allowed disabled:bg-green-800"
        >
          Create Chat
        </button>
      </form>
    </>
  );
}
