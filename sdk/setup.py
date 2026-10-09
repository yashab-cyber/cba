from setuptools import setup, find_packages

setup(
    name="cba-sdk",
    version="1.0.0",
    description="Python SDK for Central Bank of Agents (CBA) programmable banking",
    packages=find_packages(),
    install_requires=[
        "httpx>=0.24.0",
    ],
    python_requires=">=3.9",
)
