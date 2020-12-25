import React, { createRef, useState } from 'react';
import jsPDF from 'jspdf';

function ImageUpload() {
    const A4_PAPER_DIMENSIONS = {
        width: 210,
        height: 297,
    };

    const A4_PAPER_RATIO = A4_PAPER_DIMENSIONS.width / A4_PAPER_DIMENSIONS.height;

    const [images, setImages] = useState([]);

    const inputRef = createRef(null);

    const getInputRef = () => {
        return inputRef.current;
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

        if (isLandscapeImage) {
            return {
                width: A4_PAPER_DIMENSIONS.width,
                height:
                    A4_PAPER_DIMENSIONS.width / (dimensions.width / dimensions.height),
            };
        }

        const imageRatio = dimensions.width / dimensions.height;

        if (imageRatio > A4_PAPER_RATIO) {
            const imageScaleFactor = (A4_PAPER_RATIO * dimensions.height) / dimensions.width;
            const scaledImageHeight = A4_PAPER_DIMENSIONS.height * imageScaleFactor;

            return {
                height: scaledImageHeight,
                width: scaledImageHeight * imageRatio,
            };
        }

        return {
            width: A4_PAPER_DIMENSIONS.height / (dimensions.height / dimensions.width),
            height: A4_PAPER_DIMENSIONS.height
        };
    };

    const generatePdfFromImages = images => {
        const doc = new jsPDF();

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
                (A4_PAPER_DIMENSIONS.width - imageDimensions.width) / 2,
                (A4_PAPER_DIMENSIONS.height - imageDimensions.height) / 2,
                imageDimensions.width,
                imageDimensions.height
            );
        });

        console.log(doc.output('blob'));

        window.open(doc.output('bloburl'), '_blank');
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
                                            onClick={() => {
                                                const newImages = images;

                                                newImages.splice(index, 1);

                                                setImages([...newImages]);
                                            }}
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
                ref={inputRef}
                multiple
                type='file'
                accept='image/png, image/jpeg'
                style={{
                    display: 'none'
                }}
                onChange={event => {
                    setImages([...images.concat(Array.from(event.target.files))]);
                }}
            />
            <button
                onClick={() => {
                    getInputRef().click();
                }}
            >
                Selecionar Arquivos
            </button>
            <button
                disabled={images.length === 0}
                onClick={() => {
                    const readFilesPromises = [];

                    for (let i = 0; i < images.length; i++) {
                        readFilesPromises.push(readImage(images[i]));
                    }

                    Promise.all(readFilesPromises).then(files => {
                        generatePdfFromImages(files);
                    });
                }}
            >
                Enviar Arquivos
            </button>
        </div>
    );
}

export default ImageUpload;