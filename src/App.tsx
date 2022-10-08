import { MantineProvider } from "@mantine/core";
import ChatForm from "./components/ChatForm";

function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <ChatForm />
    </MantineProvider>
  );
}

export default App;
