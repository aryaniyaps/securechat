import Image from "next/image";
import * as React from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import { Dialog, DialogContent, DialogFooter } from "./dialog";

interface AvatarUploadProps extends React.HTMLProps<HTMLInputElement> {
  placeholder: string;
  avatarURL: string;
  onAvatarChange: (newAvatar: Blob) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  placeholder,
  avatarURL,
  onAvatarChange,
  disabled,
}) => {
  const [crop, setCrop] = React.useState<Crop>({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    unit: "px",
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [preview, setPreview] = React.useState(avatarURL);
  const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const onImageLoad = (img: HTMLImageElement) => {
    imgRef.current = img;
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.item(0);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      e.target.value = ""; // Clear the selected file
      setIsOpen(true);
    }
  };

  const onCropComplete = (crop: Crop) => {
    setCrop(crop);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSave = () => {
    generateCrop(crop).catch((error) => {
      console.error("Error generating crop:", error);
    });
  };

  const generateCrop = async (crop: Crop) => {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageBlob = await getCroppedImg(imgRef.current, crop);
      onAvatarChange(croppedImageBlob);
      setPreview(URL.createObjectURL(croppedImageBlob));
      setIsOpen(false);
    }
  };

  const getCroppedImg = async (image: HTMLImageElement, crop: Crop) => {
    return new Promise<Blob>((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
      }

      canvas.toBlob((blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          reject(new Error("Canvas is empty"));
          return;
        }
        onAvatarChange(blob);
        resolve(blob);
      }, "image/jpeg");
    });
  };

  return (
    <div>
      <label className="w-full cursor-pointer text-center">
        <input
          type="file"
          className="absolute hidden"
          onChange={onSelectFile}
          disabled={disabled}
          accept="image/png, image/jpeg"
        />
        <Avatar className="h-24 w-24">
          <AvatarImage src={preview} loading="eager" alt={`@${placeholder}`} />
          <AvatarFallback>{placeholder.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </label>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="flex flex-col items-center justify-center gap-6">
          <ReactCrop
            aspect={1}
            crop={crop}
            onChange={(newCrop) => setCrop(newCrop)}
            onComplete={onCropComplete}
            ruleOfThirds
            circularCrop
          >
            {selectedImage && (
              <Image
                src={selectedImage}
                ref={onImageLoad}
                //className="max-h-96 max-w-sm object-contain"
                width={300}
                height={300}
                sizes="(max-height: 300px) 100vw"
                alt="selected image"
              />
            )}
          </ReactCrop>
          <DialogFooter className="flex items-center gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
