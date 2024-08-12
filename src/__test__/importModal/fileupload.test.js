import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import FileUpload from "../../components/ImportModal/fileUpload";

describe("FileUpload component", () => {
  /**
   * Test case: should call onFileUpload when a file is selected.
   * - Renders the FileUpload component with the provided onFileUpload mock function.
   * - Simulates selecting a file using the file input.
   * - Asserts that the onFileUpload function is called with the selected file.
   */
  test("should call onFileUpload when a file is selected", () => {
    const onFileUploadMock = jest.fn();
    const { getByLabelText } = render(
      <FileUpload onFileUpload={onFileUploadMock} />
    );

    const fileInput = getByLabelText("ファイルを参照する");

    const file = new File(["file contents"], "example.png", {
      type: "image/png",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(onFileUploadMock).toHaveBeenCalledWith(file);
  });

  let onFileUploadMock;
  let preventDefaultMock;

  beforeEach(() => {
    onFileUploadMock = jest.fn();
    preventDefaultMock = jest.fn();
  });

  /**
   * Test case: should call onFileUpload when a file is dropped.
   * - Creates a mock file and drop event.
   * - Renders the FileUpload component with the provided onFileUpload mock function.
   * - Simulates dropping the file using the drop event.
   * - Asserts that the onFileUpload function is called with the dropped file.
   */
  test("should call onFileUpload when a file is dropped", () => {
    const file = new File(["dummy content"], "dummy.txt", {
      type: "text/plain",
    });
    const dropEvent = {
      preventDefault: preventDefaultMock,
      dataTransfer: {
        files: [file],
      },
    };
    const dragOverEvent = {
      preventDefault: preventDefaultMock,
    };

    const { getByTestId } = render(
      <FileUpload onFileUpload={onFileUploadMock} />
    );
    const droppedFile = getByTestId("droppedFile");
    fireEvent.dragOver(droppedFile, dragOverEvent);
    expect(onFileUploadMock).not.toHaveBeenCalled();
  
    fireEvent.drop(droppedFile, dropEvent);
    expect(onFileUploadMock).toHaveBeenCalledWith(file);
  });
});
