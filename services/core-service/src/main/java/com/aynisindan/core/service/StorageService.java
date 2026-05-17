package com.aynisindan.core.service;

import org.springframework.web.multipart.MultipartFile;

public interface StorageService {
    /**
     * Uploads a file to the storage and returns the public URL.
     *
     * @param file the multipart file to upload
     * @return the public URL of the uploaded file
     */
    String uploadFile(MultipartFile file);
}
