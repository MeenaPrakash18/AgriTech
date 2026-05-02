import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.preprocessing import image_dataset_from_directory

"""
AgriTech Advanced CNN Training Pipeline (PlantVillage & EfficientNet Optimized)
This script implements a high-accuracy, production-ready classifier for 38 plant diseases.
"""

def build_advanced_model(num_classes):
    # Base model pre-trained on ImageNet for high-level feature extraction
    base_model = EfficientNetB0(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    # Freeze the base layers to prevent destroying pre-trained weights
    base_model.trainable = False

    # Standard Input Block
    inputs = tf.keras.Input(shape=(224, 224, 3))

    # Image Augmentation block for real-world robustness (UV, Shade, Rotation)
    x = layers.RandomFlip("horizontal_and_vertical")(inputs)
    x = layers.RandomRotation(0.2)(x)
    x = layers.RandomZoom(0.2)(x)
    x = layers.RandomTranslation(0.1, 0.1)(x)
    x = layers.RandomContrast(0.1)(x) # New: handle lighting variations

    # Note: EfficientNetB0 has internal rescaling/normalization layers
    # so we don't manually apply preprocess_input here unless specific scaling is needed for older TF versions.
    # However, for consistency we'll ensure the base_model receives expected values.
    x = base_model(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x) # Better stability
    x = layers.Dropout(0.4)(x) # Prevent overfitting on 38 complex classes
    x = layers.Dense(256, activation='relu')(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation='softmax')(x)

    model = tf.keras.Model(inputs, outputs)
    
    # Compile with optimized Adam settings
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.0005),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def download_plantvillage_from_kaggle():
    """
    Automated Kaggle downloader.
    Requires kaggle.json in ~/.kaggle/ and 'kaggle' pip package installed.
    """
    try:
        import kaggle
        print("Checking for PlantVillage on Kaggle...")
        kaggle.api.dataset_download_files('emmarex/plantdisease', path='PlantVillage', unzip=True)
        print("Dataset downloaded and extracted successfully.")
    except Exception as e:
        print(f"Kaggle Download failed: {e}")
        print("Please manually download: https://www.kaggle.com/datasets/emmarex/plantdisease")

def train_production_model(dataset_dir):
    BATCH_SIZE = 32
    IMG_SIZE = (224, 224)

    if not os.path.exists(dataset_dir):
        print(f"Dataset path '{dataset_dir}' not found.")
        download_plantvillage_from_kaggle()
        if not os.path.exists(dataset_dir): return

    # Load dataset with validated labels
    train_dataset = image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    validation_dataset = image_dataset_from_directory(
        dataset_dir,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=IMG_SIZE,
        batch_size=BATCH_SIZE
    )

    class_names = train_dataset.class_names
    num_classes = len(class_names)
    print(f"Dataset Loaded. Classes: {class_names}")

    # Prefetch logic to improve performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_dataset = train_dataset.cache().shuffle(2000).prefetch(buffer_size=AUTOTUNE)
    validation_dataset = validation_dataset.cache().prefetch(buffer_size=AUTOTUNE)

    # Build and Train
    model = build_advanced_model(num_classes)
    
    # Early Stopping to prevent stagnation
    early_stop = tf.keras.callbacks.EarlyStopping(patience=3, restore_best_weights=True)

    print("\nStarting Training (Phase 1: Head Initialization)...")
    model.fit(
        train_dataset,
        validation_data=validation_dataset,
        epochs=15,
        callbacks=[early_stop]
    )

    # Optional: Fine-tuning (Uncomment if GPU available)
    # print("\nStarting Training (Phase 2: Fine-Tuning)...")
    # model.trainable = True # Unfreeze all layers
    # model.compile(optimizer=tf.keras.optimizers.Adam(1e-5), ...) # Lower learning rate
    # model.fit(...)

    # Export
    save_dir = os.path.dirname(__file__)
    model.save(os.path.join(save_dir, 'disease_model.h5'))
    with open(os.path.join(save_dir, 'disease_labels.txt'), 'w') as f:
        for label in class_names: f.write(f"{label}\n")
    print("\n✅ Advanced model and labels exported successfully.")

if __name__ == "__main__":
    DATASET_PATH = os.path.join(os.path.dirname(__file__), 'PlantVillage/plantvillage')
    train_production_model(DATASET_PATH)
