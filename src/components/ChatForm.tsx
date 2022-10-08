import VideoUpload from "./VideoUpload";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const chatFormSchema = z.object({
  title: z
    .string()
    .min(10, { message: "Your chat title should have at least 10 characters" }),
});
export default function ChatForm() {
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

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="m-12 space-y-8 max-w-lg"
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

        <VideoUpload />

        <button
          type="submit"
          className="px-4 py-2 rounded-lg text-white bg-green-600 hover:bg-green-500 hover:shadow"
        >
          Create Chat
        </button>
      </form>
    </>
  );
}
