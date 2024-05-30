import { useEffect, useRef, useState } from "react";
import { fetchImages } from "../../images-api";
import LoadMoreBtn from "../LoadMoreBtn/LoadMoreBtn";
import SearchBar from "../SearchBar/SearchBar";
import ImageGallery from "../ImageGallery/ImageGallery";
import Loader from "../Loader/Loader";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import ImageModal from "../ImageModal/ImageModal";
import ScrollToTop from "../ScrollToTop/ScrollToTop";

import IResponse from "../../images-api";

import "./App.module.css";

export default function App() {
    const [images, setimages] = useState<IResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadMore, setloadMore] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [page, setPage] = useState<number>(1);
    const [topic, setTopic] = useState<string>("");
    const [modal, setModal] = useState<boolean>(false);
    const [modalImage, setModalImage] = useState<string>("");
    const [shouldFetch, setShouldFetch] = useState<boolean>(false);
    const [nightMode, setNightMode] = useState<boolean>(true);

    const firstNewImageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        firstNewImageRef.current &&
            firstNewImageRef.current.scrollIntoView({ behavior: "smooth" });
    }, [images]);

    useEffect(() => {
        const fetchNewImages = async () => {
            try {
                setError(false);
                setLoading(true);
                const data = await fetchImages(topic, page);

                if (data && "results" in data) {
                    setimages((prevImages) => [...prevImages, ...data.results]);
                    setPage((prevPage) => prevPage + 1);
                    if (!data.total_pages) {
                        return setError(true);
                    }
                    page >= data.total_pages ? setloadMore(false) : setloadMore(true);
                } else {
                    throw new Error("Invalid data");
                }
            } catch (error) {
                setError(true);
                setloadMore(false);
            } finally {
                setLoading(false);
                setShouldFetch(false);
            }
        };

        shouldFetch && fetchNewImages();
    }, [shouldFetch, topic, page]);

    const handleImages = (newTopic) => {
        setimages([]);
        setTopic(newTopic);
        setPage(1);
        setShouldFetch(true);
    };

    const handleLoadMore = () => {
        setloadMore(false);

        setShouldFetch(true);
    };

    function handleModal(imageUrl) {
        setModal(!modal);
        setModalImage(imageUrl);
    }

    function toggleNightMode() {
        setNightMode(!nightMode);
    }

    useEffect(() => {
        if (nightMode) {
            document.body.style.backgroundColor = "#2C2C2F";
            document.body.style.color = "#fbfbfb";
        } else {
            document.body.style.backgroundColor = "#fbfbfb";
            document.body.style.color = "#2e2f42";
        }
    }, [nightMode]);

    return (
        <>
            <SearchBar
                onSubmit={handleImages}
                nightMode={nightMode}
                toggleNightMode={toggleNightMode}
            ></SearchBar>
            {error ? (
                <ErrorMessage />
            ) : (
                <>
                    {images.length > 0 && (
                        <>
                            <ImageGallery
                                items={images}
                                toggleModal={handleModal}
                                ref={firstNewImageRef}
                            />
                        </>
                    )}
                    {loading && <Loader />}
                    {loadMore && <LoadMoreBtn onClick={handleLoadMore}></LoadMoreBtn>}
                    {loadMore && <ScrollToTop />}

                    <ImageModal
                        isOpen={modal}
                        toggleModal={handleModal}
                        imageUrl={modalImage}
                    ></ImageModal>
                </>
            )}
        </>
    );
}