import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker, TimeRangeInput } from "@mantine/dates";
import dayjs from "dayjs";
import { useState } from "react";
import { FileWithPath } from "react-dropzone";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import UploadVideo from "./UploadVideo";

const chatFormSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Your chat title should have at least 10 characters" }),
  date: z.date({ required_error: "You must provide a date for this chat" }),
  times: z.array(z.date()).length(2),
  startVideo: z
    .string()
    .url({ message: "You should upload a video for this field!" }),
  endVideo: z
    .string()
    .url({ message: "You should upload a video for this field!" }),
});

interface PreviewFile extends FileWithPath {
  thumbnail: string;
  uploadProgress: number | undefined;
}

export default function ChatForm() {
  const now = dayjs().hour(9).minute(0).toDate();
  const then = dayjs(now).add(1, "hour").toDate();
  const [chatTime, setChatTime] = useState<[Date, Date]>([now, then]);

  const methods = useForm({
    mode: "onBlur",
    resolver: zodResolver(chatFormSchema),
  });

  const onSubmit = (data: any) => {
    console.log("Submitting form with the following data:");
    console.log(data);
  };

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
              className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md placeholder:text-gray-400 p-2 border"
              placeholder="A very jolly chat"
              {...methods.register("title")}
            />
          </div>
        </div>

        <div>
          <p className="font-semibold">Event Scheduling</p>
          <p className="text-gray-500 text-sm">
            Remember that your platform is set to the{" "}
            <span className="text-blue-500">Eastern Standard Time</span> (UTC -
            5)
          </p>
          <div className="grid grid-cols-2 gap-x-4 mt-2">
            <div className="flex flex-col space-y-1">
              <label className="font-semibold" htmlFor="date">
                Date
              </label>
              <Controller
                control={methods.control}
                name="date"
                render={({ field }) => (
                  <DatePicker
                    placeholder="Pick date"
                    withAsterisk
                    ref={field.ref}
                    onBlur={field.onBlur}
                    onChange={(date) => {
                      field.onChange(date);
                      console.log(field);
                    }}
                    value={field.value}
                  />
                )}
              />
            </div>
            <div className="flex flex-col space-y-1">
              <label className="font-semibold" htmlFor="time">
                Times
              </label>
              {}
              <Controller
                control={methods.control}
                name="times"
                render={({ field }) => (
                  <TimeRangeInput
                    value={field.value}
                    onChange={(times) => {
                      field.onChange(times);
                      console.log(field);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    clearable
                  />
                )}
              />
            </div>
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

          {methods.formState.errors.startVideo?.message && (
            <p className="text-red-500">
              Start video:{" "}
              {methods.formState.errors.startVideo?.message?.toString()}
            </p>
          )}
          {methods.formState.errors.endVideo?.message && (
            <p className="text-red-500">
              End video:{" "}
              {methods.formState.errors.endVideo?.message?.toString()}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-500 hover:shadow w-full mt-4 disabled:cursor-not-allowed disabled:bg-green-800"
        >
          Create Chat
        </button>
      </form>
    </FormProvider>
  );
}
