import React, { createRef, useState, useRef } from 'react';
import jsPDF from 'jspdf';

function ImageUpload() {
    const [images, setImages] = useState([]);

    const a4PaperDimensions = useRef({
        a4PaperWidth: 210,
        a4PaperHeight: 297,
    });

    const inputFileRef = createRef(null);

    const getA4PaperDimensions = () => {
        return a4PaperDimensions.current;
    };

    const getInputFileRef = () => {
        return inputFileRef.current;
    };

    const readImage = file => {
        return new Promise(resolve => {
            const fileReader = new FileReader();

            fileReader.onload = event => {
                const fileBase64 = event.target.result;
                const img = new Image();

                img.src = fileBase64;
                img.onload = () => {
                    resolve({
                        width: img.width,
                        height: img.height,
                        data: fileBase64,
                        type: file.type
                    });
                };
            };

            fileReader.readAsDataURL(file);
        });
    };

    const imageDimensionsOnA4 = dimensions => {
        const isLandscapeImage = dimensions.width >= dimensions.height;
        const { a4PaperWidth, a4PaperHeight } = getA4PaperDimensions();

        if (isLandscapeImage) {
            return {
                width: a4PaperWidth,
                height:
                    a4PaperWidth / (dimensions.width / dimensions.height),
            };
        }

        const imageRatio = dimensions.width / dimensions.height;
        const a4PaperRatio = a4PaperWidth / a4PaperHeight;

        if (imageRatio > a4PaperRatio) {
            const imageScaleFactor = (a4PaperRatio * dimensions.height) / dimensions.width;
            const scaledImageHeight = a4PaperHeight * imageScaleFactor;

            return {
                height: scaledImageHeight,
                width: scaledImageHeight * imageRatio,
            };
        }

        return {
            width: a4PaperHeight / (dimensions.height / dimensions.width),
            height: a4PaperHeight
        };
    };

    const generatePdfFromImages = images => {
        const doc = new jsPDF();
        const { a4PaperWidth, a4PaperHeight } = getA4PaperDimensions();

        doc.deletePage(1);

        images.forEach(image => {
            const imageDimensions = imageDimensionsOnA4({
                width: image.width,
                height: image.height,
            });

            doc.addPage();
            doc.addImage(
                image.data,
                image.type,
                (a4PaperWidth - imageDimensions.width) / 2,
                (a4PaperHeight - imageDimensions.height) / 2,
                imageDimensions.width,
                imageDimensions.height
            );
        });

        console.log(doc.output('blob'));

        window.open(doc.output('bloburl'), '_blank');
    };

    const handleOnInputFileChange = event => {
        setImages([...images.concat(Array.from(event.target.files))]);
    };

    const handleOnSelectFilesButtonClick = () => {
        getInputFileRef().click();
    };

    const handleOnSendFilesButtonClick = () => {
        const readFilesPromises = [];

        for (let i = 0; i < images.length; i++) {
            readFilesPromises.push(readImage(images[i]));
        }

        Promise.all(readFilesPromises).then(files => {
            generatePdfFromImages(files);
        });
    };

    const handleOnDeleteFileButtonClick = event => {
        const newImages = images;

        newImages.splice(event.currentTarget.dataset.index, 1);

        setImages([...newImages]);
    };

    return (
        <div>
            {images.length > 0 &&
                <table>
                    <thead>
                        <tr>
                            <th>Ações</th>
                            <th>Arquivo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {images.map((value, index) => {
                            return (
                                <tr key={`tr${index}`}>
                                    <td>
                                        <button
                                            data-index={index}
                                            onClick={handleOnDeleteFileButtonClick}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                    <td>{value.name}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            }
            <input
                ref={inputFileRef}
                multiple
                type='file'
                accept='image/png, image/jpeg'
                style={{
                    display: 'none'
                }}
                onChange={handleOnInputFileChange}
            />
            <button onClick={handleOnSelectFilesButtonClick}>
                Selecionar Arquivos
            </button>
            <button
                disabled={images.length === 0}
                onClick={handleOnSendFilesButtonClick}
            >
                Enviar Arquivos
            </button>
        </div>
    );
}

export default ImageUpload;