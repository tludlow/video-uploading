import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { FormProvider, useForm } from "react-hook-form";
import { v4 } from "uuid";
import { z } from "zod";
import generateVideoThumbnail from "../utils/thumbnail";
import axios from "axios";
import UploadIcon from "./icons/UploadIcon";
import UploadVideo from "./UploadVideo";

const chatFormSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Your chat title should have at least 10 characters" }),
  startVideo: z.any(),
  endVideo: z.any(),
});

interface PreviewFile extends FileWithPath {
  thumbnail: string;
  uploadProgress: number | undefined;
}

export default function ChatForm() {
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [filesUploading, setFilesUploading] = useState(false);

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(chatFormSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Submitting form with the following data:");
    console.log(data);
  };

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.thumbnail));
    },
    [files]
  );

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
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
          {methods.formState.errors.title?.message && (
            <p className="text-red-500 text-sm">
              {methods.formState.errors.title?.message?.toString()}
            </p>
          )}
          <div className="mt-1">
            <input
              type="text"
              id="title"
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder:text-gray-400"
              placeholder="you@example.com"
              {...methods.register("title")}
            />
          </div>
        </div>

        <div>
          <p className="font-semibold">Videos</p>
          <p className="text-gray-400 text-sm">
            Provide some brief topical videos to introduce your live chat and
            finish the live chat off with direction for participants
          </p>
          <div className="grid grid-cols-2 gap-x-4 mt-4">
            <UploadVideo
              label="Start Video"
              formName="startVideo"
              setUploadedFile={methods.setValue}
            />
            <UploadVideo
              label="End Video"
              formName="endVideo"
              setUploadedFile={methods.setValue}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={filesUploading}
          className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-500 hover:shadow w-full mt-4 disabled:cursor-not-allowed disabled:bg-green-800"
        >
          Create Chat
        </button>
      </form>
    </FormProvider>
  );
}
