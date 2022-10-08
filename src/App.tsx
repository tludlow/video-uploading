import { MantineProvider, Progress } from "@mantine/core";
import { Group, Text, useMantineTheme } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons";
import { Dropzone, FileWithPath, MIME_TYPES } from "@mantine/dropzone";
import { useEffect, useState } from "react";
import axios from "axios";
import { v4 } from "uuid";

interface PreviewFile extends FileWithPath {
  preview: string;
}

function App() {
  const theme = useMantineTheme();
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<undefined | number>(
    undefined
  );
  const [preview, setPreview] = useState<undefined | string>(undefined);

  const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const video = document.createElement("video");

      // this is important
      video.autoplay = true;
      video.muted = true;
      video.src = URL.createObjectURL(file);
      // Get the thumbnail image 5s in so we dont have a starting frame that is maybe black
      video.currentTime = 5;

      video.onloadeddata = () => {
        let ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        video.pause();
        return resolve(canvas.toDataURL("image/png"));
      };
    });
  };

  const onUpload = async (acceptedFiles: FileWithPath[]) => {
    const thumbnail = await generateVideoThumbnail(acceptedFiles[0]);

    const filesToSet: PreviewFile[] = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: thumbnail,
      })
    );

    setFiles(filesToSet);
    setPreview(filesToSet[0].preview);

    console.log("Uploading file:");
    console.log(filesToSet);
    const data = new FormData();
    data.append("file", acceptedFiles[0]);
    data.append("upload_preset", "video-upload-browser");
    data.append("public_id", v4());
    data.append("api_key", "539567675919287");
    // data.append("return_delete_token", "true");
    // data.append("metadata", "platform=69|chat=12345");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dfv8hufs2/video/upload",
        data,
        {
          onUploadProgress: (progress) => {
            console.log("Progress:");
            console.log(progress);
            setUploadProgress(progress.progress);
          },
        }
      );

      console.log(res);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(
    () => () => {
      // Make sure to revoke the data uris to avoid memory leaks
      files.forEach((file) => URL.revokeObjectURL(file.preview));
    },
    [files]
  );

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <div className="m-12">
        <Dropzone
          onDrop={(file) => onUpload(file)}
          onReject={(files) => console.log("rejected files", files)}
          maxSize={3 * 1024 ** 2000}
          accept={[MIME_TYPES.mp4]}
          multiple={false}
          // {...props}
        >
          <Group
            position="center"
            spacing="xl"
            style={{ minHeight: 220, pointerEvents: "none" }}
          >
            <Dropzone.Accept>
              <IconUpload
                size={50}
                stroke={1.5}
                color={
                  theme.colors[theme.primaryColor][
                    theme.colorScheme === "dark" ? 4 : 6
                  ]
                }
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                size={50}
                stroke={1.5}
                color={theme.colors.red[theme.colorScheme === "dark" ? 4 : 6]}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto size={50} stroke={1.5} />
            </Dropzone.Idle>
            <div>
              <Text size="xl" inline>
                Drag images here or click to select files
              </Text>
              <Text size="sm" color="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed
                5mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      </div>
      <div className="mx-10 space-y-6">
        {preview && <p>{files[0].name}</p>}
        {preview && <img src={preview} />}
        {uploadProgress && uploadProgress > 0 && (
          <Progress value={uploadProgress * 100} animate />
        )}
      </div>
    </MantineProvider>
  );
}

export default App;
