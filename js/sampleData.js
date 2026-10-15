// Pre-loaded study materials for instant testing without needing an internet connection or external files
window.SAMPLE_STUDY_MATERIALS = [
  {
    fileName: 'Biologi_Fotosintesis_dan_Kloroplas.txt',
    fileType: 'Biology Study Material',
    content: `BAB 1: PENGERTIAN DAN PERSAMAAN FOTOSINTESIS
Fotosintesis adalah proses biokimia mendasar di mana tumbuhan hijau, alga, dan fitoplankton mengubah energi cahaya matahari menjadi energi kimia dalam bentuk glukosa atau karbohidrat. Proses ini terjadi di dalam organel seluler yang disebut kloroplas.

Kloroplas mengandung pigmen penangkap cahaya yang disebut klorofil. Klorofil menyerap spektrum cahaya merah dan biru dari sinar matahari, sedangkan cahaya hijau dipantulkan kembali sehingga daun tampak berwarna hijau bagi mata kita.

Persamaan reaksi kimia umum fotosintesis adalah:
6CO2 + 6H2O + Cahaya Matahari -> C6H12O6 + 6O2
Dalam reaksi ini, karbon dioksida (CO2) yang diserap melalui stomata daun dan air (H2O) yang diserap oleh akar diubah menjadi glukosa (C6H12O6) dan gas oksigen (O2) yang dilepaskan ke udara sebagai produk sampingan yang vital bagi seluruh kehidupan di bumi.

BAB 2: REAKSI TERANG (LIGHT REACTIONS)
Fotosintesis terdiri dari dua tahapan berkesinambungan:
1. Reaksi Terang (Light-Dependent Reactions):
Berlangsung di dalam membran tilakoid kloroplas. Reaksi ini memerlukan energi foton cahaya matahari secara langsung. Pada tahap ini, air (H2O) dipecah melalui peristiwa fotolisis air menjadi ion hidrogen, elektron, dan oksigen. Elektron bergerak melalui rantai transpor elektron (fotosistem II dan fotosistem I) yang menghasilkan molekul pembawa energi kimia tinggi, yaitu ATP (Adenosin Trifosfat) dan NADPH.

BAB 3: REAKSI GELAP ATAU SIKLUS CALVIN
2. Reaksi Gelap / Siklus Calvin (Light-Independent Reactions):
Berlangsung di stroma kloroplas. Tahapan ini tidak memerlukan cahaya secara langsung, tetapi sangat bergantung pada ketersediaan ATP dan NADPH dari reaksi terang sebelumnya. Enzim kunci RuBisCO memfiksasi karbon dioksida (CO2) ke dalam molekul gula berkarbon 5 (RuBP), yang kemudian direduksi menjadi glukosa (G3P / C6H12O6).

BAB 4: FAKTOR YANG MEMPENGARUHI LAJU FOTOSINTESIS
Laju fotosintesis dipengaruhi oleh empat faktor utama:
- Intensitas Cahaya: Meningkatkan pembentukan ATP dan NADPH hingga mencapai titik saturasi cahaya.
- Konsentrasi Karbon Dioksida: Konsentrasi CO2 yang lebih tinggi memacu enzim RuBisCO bekerja lebih cepat.
- Suhu: Suhu ideal berkisar antara 20°C sampai 30°C. Suhu di atas 40°C dapat menyebabkan denaturasi enzim dan kerusakan stomata.
- Ketersediaan Air: Dehidrasi menyebabkan stomata menutup untuk mencegah transpirasi berlebih, yang berakibat terhambatnya asupan CO2 ke dalam sel mesofil daun.`
  },
  {
    fileName: 'Operating_Systems_Virtual_Memory.txt',
    fileType: 'Computer Science Lecture Notes',
    content: `CHAPTER 1: INTRODUCTION TO VIRTUAL MEMORY
Virtual memory is a fundamental operating system architecture that decouples a program's logical address space from the physical memory (RAM) installed on the hardware. It allows modern operating systems to present each running process with the illusion of a vast, contiguous block of dedicated memory, regardless of fragmentation or physical RAM limitations.

Core advantages of virtual memory include:
- Memory Isolation: Each process operates in its own private address space, preventing corrupted pointers or malicious applications from modifying the memory of other processes or the kernel.
- Overcommitment & Swapping: Processes whose memory requirements exceed physical RAM can run seamlessly because inactive pages are moved to swap storage on disk.
- Demand Paging: Code and data are only loaded from storage into RAM when actively touched by the CPU.

CHAPTER 2: PAGING ARCHITECTURE AND THE MMU
Virtual memory systems divide address spaces into uniform chunks:
- Virtual address space is divided into units called Pages (commonly 4 Kilobytes).
- Physical address space (RAM) is divided into units called Frames.
- The hardware Memory Management Unit (MMU) translates Virtual Page Numbers (VPN) to Physical Frame Numbers (PFN) using Page Tables.
- The Translation Lookaside Buffer (TLB) acts as a high-speed hardware cache for recently accessed page table translations to avoid multi-level memory lookups.

CHAPTER 3: PAGE FAULTS AND REPLACEMENT ALGORITHMS
A Page Fault occurs when a thread attempts to access a virtual memory address that is valid in the process's page table, but currently does not reside in a physical RAM frame (the valid/present bit is 0).
The OS page fault handler intercepts the hardware trap:
1. Locates an available physical frame in RAM.
2. Reads the missing page from disk swap space into the allocated physical frame.
3. Updates the process page table entry and marks the page as present.
4. Restarts the faulting CPU instruction transparently.

Page Replacement Policies:
- FIFO (First-In First-Out): Evicts the oldest page loaded. Suffers from Belady's Anomaly where increasing physical frames can paradoxically increase page faults.
- LRU (Least Recently Used): Evicts the page that has not been accessed for the longest duration, exploiting temporal locality.
- Clock (Second Chance): Uses a circular buffer and reference bits to approximate LRU efficiently.

Thrashing:
Thrashing occurs when the total working sets of active processes exceed available physical memory. The operating system spends almost 100% of its execution time swapping pages back and forth from disk rather than executing user code, causing system throughput to collapse.`
  }
];
